/**
 * Web Push sender — pure Web Crypto API, Cloudflare Workers compatible.
 * Implements the aesgcm content encoding (draft-ietf-webpush-encryption)
 * and RFC 8292 VAPID authentication.
 *
 * No npm dependencies. Works in Edge / Cloudflare Workers / Node 18+.
 */

// ─── Encoding helpers ────────────────────────────────────────────────────────

function b64uDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=')
  const bin = atob(padded)
  return Uint8Array.from(bin, c => c.charCodeAt(0))
}

function b64uEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function concat(...bufs: (ArrayBuffer | Uint8Array)[]): Uint8Array {
  const total = bufs.reduce((s, b) => s + (b instanceof Uint8Array ? b.byteLength : (b as ArrayBuffer).byteLength), 0)
  const out = new Uint8Array(total)
  let off = 0
  for (const b of bufs) {
    const arr = b instanceof Uint8Array ? b : new Uint8Array(b)
    out.set(arr, off)
    off += arr.byteLength
  }
  return out
}

// Big-endian uint16 (for key lengths in context per RFC 8291)
function uint16BE(n: number): Uint8Array {
  return new Uint8Array([(n >> 8) & 0xff, n & 0xff])
}

const enc = new TextEncoder()

// ─── HKDF helpers ────────────────────────────────────────────────────────────

async function hmacSha256(key: ArrayBuffer | Uint8Array, data: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, data))
}

/** HKDF-Extract: PRK = HMAC-SHA256(salt, IKM) */
async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  return hmacSha256(salt, ikm)
}

/** HKDF-Expand: T(1) = HMAC-SHA256(PRK, info || 0x01) */
async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const t1 = await hmacSha256(prk, concat(info, new Uint8Array([0x01])))
  return t1.slice(0, length)
}

async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const prk = await hkdfExtract(salt, ikm)
  return hkdfExpand(prk, info, length)
}

// ─── VAPID JWT (RFC 8292) ────────────────────────────────────────────────────

/**
 * Convert DER-encoded ECDSA signature to raw r||s (64 bytes).
 * Cloudflare Workers SubtleCrypto returns DER; browsers return raw.
 */
function ecdsaDerToRaw(der: Uint8Array): Uint8Array {
  if (der.length === 64) return der // already raw
  // Parse DER: SEQUENCE { INTEGER r, INTEGER s }
  let off = 2 // skip SEQUENCE tag + length
  const rLen = der[off + 1]; off += 2
  const r = der.slice(off, off + rLen); off += rLen
  const sLen = der[off + 1]; off += 2
  const s = der.slice(off, off + sLen)
  const raw = new Uint8Array(64)
  // r and s are right-aligned in 32-byte slots (strip leading 0x00 padding byte)
  raw.set(r.slice(-32), 32 - Math.min(r.length, 32))
  raw.set(s.slice(-32), 64 - Math.min(s.length, 32))
  return raw
}

export async function buildVapidJWT(
  audience: string,
  subject: string,
  privateKeyB64u: string,
  publicKeyB64u: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { typ: 'JWT', alg: 'ES256' }
  const payload = { aud: audience, exp: now + 12 * 3600, sub: `mailto:${subject}` }

  const headerB64 = b64uEncode(enc.encode(JSON.stringify(header)))
  const payloadB64 = b64uEncode(enc.encode(JSON.stringify(payload)))
  const sigInput = enc.encode(`${headerB64}.${payloadB64}`)

  // Reconstruct JWK from raw private key d and public key x,y
  const pubBytes = b64uDecode(publicKeyB64u)
  const x = b64uEncode(pubBytes.slice(1, 33))
  const y = b64uEncode(pubBytes.slice(33, 65))
  const jwk = { kty: 'EC', crv: 'P-256', d: privateKeyB64u, x, y }

  const privKey = await crypto.subtle.importKey(
    'jwk', jwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']
  )
  const sigDer = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, sigInput))
  const sig = ecdsaDerToRaw(sigDer)

  return `${headerB64}.${payloadB64}.${b64uEncode(sig)}`
}

// ─── aesgcm payload encryption (draft-ietf-webpush-encryption) ───────────────

/**
 * Build the "context" used in CEK/nonce derivation.
 * context = "P-256\0" || uint16be(65) || client_pub_key || uint16be(65) || server_pub_key
 */
function buildContext(clientPub: Uint8Array, serverPub: Uint8Array): Uint8Array {
  return concat(
    enc.encode('P-256\0'),
    uint16BE(clientPub.length), clientPub,
    uint16BE(serverPub.length), serverPub,
  )
}

export async function encryptPushPayload(
  plaintext: string,
  subscriberPublicKeyB64u: string,
  authSecretB64u: string
): Promise<{ ciphertext: ArrayBuffer; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // Ephemeral server ECDH key pair
  const serverKP = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits'])
  const serverPublicKey = new Uint8Array(await crypto.subtle.exportKey('raw', serverKP.publicKey))

  // Import subscriber's public key
  const subPub = await crypto.subtle.importKey(
    'raw', b64uDecode(subscriberPublicKeyB64u),
    { name: 'ECDH', namedCurve: 'P-256' }, false, []
  )

  // ECDH shared secret
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: subPub }, serverKP.privateKey, 256))

  const authSecret = b64uDecode(authSecretB64u)
  const clientPublicKey = b64uDecode(subscriberPublicKeyB64u)

  // Step 1: Derive key_material from auth secret
  // key_material = HKDF(salt=auth_secret, IKM=ecdh_secret, info="Content-Encoding: auth\0", len=32)
  const authInfo = enc.encode('Content-Encoding: auth\0')
  const keyMaterial = await hkdf(authSecret, ecdhSecret, authInfo, 32)

  // Step 2: Build context for CEK/nonce derivation
  const context = buildContext(clientPublicKey, serverPublicKey)

  // Step 3: Derive CEK
  const cekInfo = concat(enc.encode('Content-Encoding: aesgcm\0'), context)
  const cek = await hkdf(salt, keyMaterial, cekInfo, 16)

  // Step 4: Derive nonce
  const nonceInfo = concat(enc.encode('Content-Encoding: nonce\0'), context)
  const nonce = await hkdf(salt, keyMaterial, nonceInfo, 12)

  // Step 5: AES-128-GCM encrypt
  // Pad: 2-byte big-endian padding length (0) + payload
  const msgBytes = enc.encode(plaintext)
  const padded = new Uint8Array(2 + msgBytes.length)
  // padded[0..1] = 0x00 0x00 (zero padding)
  padded.set(msgBytes, 2)

  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, padded)

  return { ciphertext, salt, serverPublicKey }
}

// ─── Send push ───────────────────────────────────────────────────────────────

export interface PushSubscriptionData {
  endpoint: string
  p256dh: string
  auth: string
}

export interface PushPayload {
  title: string
  body: string
  badge?: number
  url?: string
  tag?: string
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  vapidSubject: string
): Promise<{ success: boolean; status?: number; error?: string }> {
  try {
    const url = new URL(subscription.endpoint)
    const audience = `${url.protocol}//${url.host}`

    const jwt = await buildVapidJWT(audience, vapidSubject, vapidPrivateKey, vapidPublicKey)

    const { ciphertext, salt, serverPublicKey } = await encryptPushPayload(
      JSON.stringify(payload),
      subscription.p256dh,
      subscription.auth
    )

    const res = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `vapid t=${jwt},k=${vapidPublicKey}`,
        'Content-Encoding': 'aesgcm',
        'Encryption': `salt=${b64uEncode(salt)}`,
        'Crypto-Key': `dh=${b64uEncode(serverPublicKey)}`,
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
      },
      body: ciphertext,
    })

    if (res.ok || res.status === 201 || res.status === 202) {
      return { success: true, status: res.status }
    }
    const body = await res.text().catch(() => '')
    return { success: false, status: res.status, error: body || `Push server: ${res.status}` }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unknown error' }
  }
}

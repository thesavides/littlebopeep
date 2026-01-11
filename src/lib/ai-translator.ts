/**
 * AI Translation Service
 * Uses Claude API to translate UI strings to multiple languages
 */

export interface TranslationEntry {
  key: string
  value: string
  namespace: string
  context?: string
}

export interface TranslateOptions {
  sourceLanguage?: string
  targetLanguage: string
  preserveVariables?: boolean
  contextNotes?: string
}

/**
 * Translate a batch of strings using Claude API
 * Note: Requires ANTHROPIC_API_KEY environment variable
 */
export async function translateBatch(
  entries: TranslationEntry[],
  options: TranslateOptions
): Promise<TranslationEntry[]> {
  const { sourceLanguage = 'en', targetLanguage, preserveVariables = true, contextNotes } = options

  // Language mapping for better Claude understanding
  const languageNames: Record<string, string> = {
    en: 'English',
    cy: 'Welsh (Cymraeg)',
    ga: 'Irish Gaelic (Gaeilge)',
    gd: 'Scottish Gaelic (Gàidhlig)',
  }

  const sourceLangName = languageNames[sourceLanguage] || sourceLanguage
  const targetLangName = languageNames[targetLanguage] || targetLanguage

  // Build the prompt for Claude
  const prompt = `You are a professional translator specializing in ${targetLangName}. Your task is to translate UI strings from ${sourceLangName} to ${targetLangName} for a web application.

Application Context: Little Bo Peep - A platform connecting countryside walkers who spot lost sheep with farmers who need to recover them.

Translation Guidelines:
1. Maintain the tone and formality of the original text
2. Preserve any variables in curly braces like {name}, {count}, etc.
3. Keep technical terms consistent
4. Consider cultural context for ${targetLangName} speakers
5. Return ONLY valid JSON, no additional commentary
${preserveVariables ? '6. CRITICAL: Do not translate text inside {curly braces} - these are variable placeholders' : ''}
${contextNotes ? `\n\nAdditional Context:\n${contextNotes}` : ''}

Input Format:
[
  {"key": "translation.key", "value": "English text", "namespace": "category", "context": "optional context"}
]

Output Format (return ONLY this, no explanation):
[
  {"key": "translation.key", "value": "Translated text", "namespace": "category"}
]

Strings to translate:
${JSON.stringify(entries, null, 2)}`

  try {
    // Call Claude API
    // Note: This uses the Anthropic API (not included in this file)
    // You'll need to install @anthropic-ai/sdk and configure it
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`)
    }

    const result = await response.json()
    const translatedText = result.content[0].text

    // Parse JSON response
    const translated: TranslationEntry[] = JSON.parse(translatedText)

    return translated
  } catch (error) {
    console.error('Translation error:', error)
    throw new Error(`Failed to translate to ${targetLangName}: ${error}`)
  }
}

/**
 * Translate all strings for a language
 * Processes in batches to avoid token limits
 */
export async function translateAll(
  allEntries: TranslationEntry[],
  targetLanguage: string,
  batchSize: number = 50
): Promise<TranslationEntry[]> {
  const results: TranslationEntry[] = []

  // Process in batches
  for (let i = 0; i < allEntries.length; i += batchSize) {
    const batch = allEntries.slice(i, i + batchSize)

    console.log(
      `Translating batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allEntries.length / batchSize)}...`
    )

    const translated = await translateBatch(batch, {
      targetLanguage,
      preserveVariables: true,
    })

    results.push(...translated)

    // Small delay to avoid rate limiting
    if (i + batchSize < allEntries.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return results
}

/**
 * Verify translation quality
 * Checks if variables are preserved, length is reasonable, etc.
 */
export function verifyTranslation(
  original: TranslationEntry,
  translated: TranslationEntry
): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  // Check if keys match
  if (original.key !== translated.key) {
    issues.push('Translation key mismatch')
  }

  // Check if variables are preserved
  const originalVars: string[] = original.value.match(/\{[^}]+\}/g) || []
  const translatedVars: string[] = translated.value.match(/\{[^}]+\}/g) || []

  if (originalVars.length !== translatedVars.length) {
    issues.push(`Variable count mismatch: expected ${originalVars.length}, got ${translatedVars.length}`)
  }

  // Check if all original variables are in translation
  originalVars.forEach((variable) => {
    if (!translatedVars.includes(variable)) {
      issues.push(`Missing variable: ${variable}`)
    }
  })

  // Check if translation is empty
  if (!translated.value || translated.value.trim().length === 0) {
    issues.push('Translation is empty')
  }

  // Check if translation is suspiciously long (>3x original length)
  if (translated.value.length > original.value.length * 3) {
    issues.push('Translation is suspiciously long')
  }

  return {
    valid: issues.length === 0,
    issues,
  }
}

/**
 * Simple fallback translation using dictionary
 * (Not AI-powered, just for testing/fallback)
 */
export function simpleFallbackTranslate(
  entry: TranslationEntry,
  targetLanguage: string
): TranslationEntry {
  // This is a placeholder - in reality, you'd want a proper fallback
  // For now, just return the original with a prefix indicating the target language
  return {
    ...entry,
    value: `[${targetLanguage.toUpperCase()}] ${entry.value}`,
  }
}

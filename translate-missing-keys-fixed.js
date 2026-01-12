#!/usr/bin/env node

/**
 * Fixed Translation Script for Little Bo Peep
 * Handles Unicode characters properly for Celtic languages
 */

const https = require('https');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

const LANGUAGES = {
  cy: { name: 'Welsh', nativeName: 'Cymraeg' },
  ga: { name: 'Irish', nativeName: 'Gaeilge' },
  gd: { name: 'Scottish Gaelic', nativeName: 'Gàidhlig' }
};

// Helper to escape special characters for JSON
function escapeForJSON(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

async function fetchEnglishKeys() {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/translations`);
    url.searchParams.append('language_code', 'eq.en');
    url.searchParams.append('select', 'key,value,namespace,context');

    const options = {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchExistingTranslations(languageCode) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/translations`);
    url.searchParams.append('language_code', 'eq.' + languageCode);
    url.searchParams.append('select', 'key');

    const options = {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const existing = JSON.parse(data);
          resolve(new Set(existing.map(t => t.key)));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function translateWithClaude(texts, targetLanguage) {
  const languageInfo = LANGUAGES[targetLanguage];

  // Simplified prompt to reduce token usage and avoid JSON issues
  const textList = texts.map((t, i) => `${i + 1}. ${t}`).join('\n');

  const prompt = `Translate these English UI texts to ${languageInfo.name}. Keep {{variables}} unchanged. Return only translations, numbered 1-${texts.length}:

${textList}`;

  return new Promise((resolve, reject) => {
    const payload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: `Expert ${languageInfo.name} translator for UI localization.`
    };

    // Properly encode as UTF-8 JSON
    const data = Buffer.from(JSON.stringify(payload), 'utf8');

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.setEncoding('utf8');
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          if (response.content && response.content[0] && response.content[0].text) {
            const translations = response.content[0].text
              .split('\n')
              .filter(line => /^\d+\./.test(line))
              .map(line => line.replace(/^\d+\.\s*/, '').trim());
            resolve(translations);
          } else {
            reject(new Error('Invalid API response: ' + responseData.substring(0, 200)));
          }
        } catch (e) {
          reject(new Error('Parse error: ' + e.message + ' - ' + responseData.substring(0, 200)));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function insertTranslations(translations) {
  return new Promise((resolve, reject) => {
    const data = Buffer.from(JSON.stringify(translations), 'utf8');

    const url = new URL(`${SUPABASE_URL}/rest/v1/translations`);

    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json; charset=utf-8',
        'Prefer': 'return=minimal',
        'Content-Length': data.length
      }
    };

    const req = https.request(url, options, (res) => {
      let responseData = '';
      res.on('data', chunk => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, count: translations.length });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('🚀 Starting FIXED translation process...\n');

  try {
    console.log('📥 Fetching English translation keys...');
    const englishKeys = await fetchEnglishKeys();
    console.log(`✅ Found ${englishKeys.length} English keys\n`);

    for (const [langCode, langInfo] of Object.entries(LANGUAGES)) {
      console.log(`\n🌍 Processing ${langInfo.name} (${langCode})...`);

      const existingKeys = await fetchExistingTranslations(langCode);
      console.log(`   Found ${existingKeys.size} existing translations`);

      const missingKeys = englishKeys.filter(key => !existingKeys.has(key.key));
      console.log(`   Missing: ${missingKeys.length} keys`);

      if (missingKeys.length === 0) {
        console.log(`   ✅ ${langInfo.name} is complete!`);
        continue;
      }

      // Smaller batches to avoid token limits
      const BATCH_SIZE = 10;
      const translations = [];
      let successCount = 0;

      for (let i = 0; i < missingKeys.length; i += BATCH_SIZE) {
        const batch = missingKeys.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(missingKeys.length / BATCH_SIZE);

        console.log(`   📝 Batch ${batchNum}/${totalBatches} (${batch.length} keys)...`);

        try {
          const texts = batch.map(k => k.value);
          const translated = await translateWithClaude(texts, langCode);

          for (let j = 0; j < batch.length; j++) {
            if (translated[j]) {
              translations.push({
                key: batch[j].key,
                language_code: langCode,
                value: translated[j],
                namespace: batch[j].namespace,
                context: batch[j].context
              });
              successCount++;
            }
          }

          console.log(`      ✅ Translated ${translated.length} keys`);

          // Rate limiting - wait 3 seconds between batches
          if (i + BATCH_SIZE < missingKeys.length) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } catch (error) {
          console.error(`      ❌ Error: ${error.message}`);
          // Continue with next batch
        }
      }

      // Insert in smaller chunks
      if (translations.length > 0) {
        console.log(`   💾 Inserting ${translations.length} translations...`);

        const CHUNK_SIZE = 50;
        for (let i = 0; i < translations.length; i += CHUNK_SIZE) {
          const chunk = translations.slice(i, i + CHUNK_SIZE);
          try {
            await insertTranslations(chunk);
            console.log(`      ✅ Inserted chunk ${Math.floor(i / CHUNK_SIZE) + 1} (${chunk.length} translations)`);
          } catch (error) {
            console.error(`      ❌ Insert error: ${error.message}`);
          }
        }

        console.log(`   ✅ Successfully inserted ${successCount} ${langInfo.name} translations`);
      }
    }

    console.log('\n🎉 Translation process complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   Total English keys: ${englishKeys.length}`);
    console.log(`   Languages processed: ${Object.keys(LANGUAGES).length}`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

main();

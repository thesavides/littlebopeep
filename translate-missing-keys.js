#!/usr/bin/env node

/**
 * Translation Script for Little Bo Peep
 * Translates all English translation keys to Welsh (cy), Irish (ga), and Scottish Gaelic (gd)
 * Uses Claude API for high-quality translations
 */

const https = require('https');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oyfikxdowpekmcxszbqg.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

// Language configurations
const LANGUAGES = {
  cy: { name: 'Welsh', nativeName: 'Cymraeg' },
  ga: { name: 'Irish', nativeName: 'Gaeilge' },
  gd: { name: 'Scottish Gaelic', nativeName: 'Gàidhlig' }
};

/**
 * Fetch all English translation keys from Supabase
 */
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

/**
 * Fetch existing translations for a language
 */
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

/**
 * Translate text using Claude API
 */
async function translateWithClaude(texts, targetLanguage) {
  const languageInfo = LANGUAGES[targetLanguage];
  
  const prompt = `You are a professional translator specializing in ${languageInfo.name} (${languageInfo.nativeName}) translations for user interfaces.

Translate the following English UI text to ${languageInfo.name}. Maintain the same tone, formality, and context.

IMPORTANT RULES:
1. Keep placeholder variables like {{count}}, {{name}}, {{farmName}} exactly as they are - do not translate them
2. Maintain HTML tags if present
3. Keep the same punctuation and formatting
4. Use natural, native ${languageInfo.name} that a native speaker would use
5. Consider UI/UX context - these are for a sheep tracking application
6. Return ONLY the translations, one per line, in the same order as the input

English texts to translate:
${texts.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Provide ${languageInfo.name} translations (one per line, numbered):`;

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }],
      system: `You are an expert ${languageInfo.name} translator focused on UI/UX localization.`
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
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
            reject(new Error('Invalid API response: ' + JSON.stringify(response)));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Insert translations into Supabase
 */
async function insertTranslations(translations) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(translations);
    
    const url = new URL(`${SUPABASE_URL}/rest/v1/translations`);
    
    const options = {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
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

/**
 * Main translation workflow
 */
async function main() {
  console.log('🚀 Starting translation process...\n');

  try {
    // Step 1: Fetch all English keys
    console.log('📥 Fetching English translation keys...');
    const englishKeys = await fetchEnglishKeys();
    console.log(`✅ Found ${englishKeys.length} English keys\n`);

    // Step 2: Process each language
    for (const [langCode, langInfo] of Object.entries(LANGUAGES)) {
      console.log(`\n🌍 Processing ${langInfo.name} (${langCode})...`);
      
      // Fetch existing translations
      const existingKeys = await fetchExistingTranslations(langCode);
      console.log(`   Found ${existingKeys.size} existing translations`);

      // Find missing keys
      const missingKeys = englishKeys.filter(key => !existingKeys.has(key.key));
      console.log(`   Missing: ${missingKeys.length} keys`);

      if (missingKeys.length === 0) {
        console.log(`   ✅ ${langInfo.name} is complete!`);
        continue;
      }

      // Translate in batches of 20
      const BATCH_SIZE = 20;
      const translations = [];

      for (let i = 0; i < missingKeys.length; i += BATCH_SIZE) {
        const batch = missingKeys.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(missingKeys.length / BATCH_SIZE);

        console.log(`   📝 Translating batch ${batchNum}/${totalBatches} (${batch.length} keys)...`);

        try {
          const texts = batch.map(k => k.value);
          const translated = await translateWithClaude(texts, langCode);

          // Create translation records
          for (let j = 0; j < batch.length; j++) {
            if (translated[j]) {
              translations.push({
                key: batch[j].key,
                language_code: langCode,
                value: translated[j],
                namespace: batch[j].namespace,
                context: batch[j].context
              });
            }
          }

          // Rate limiting - wait 2 seconds between batches
          if (i + BATCH_SIZE < missingKeys.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`   ❌ Error translating batch ${batchNum}:`, error.message);
          // Continue with next batch
        }
      }

      // Insert translations into database
      if (translations.length > 0) {
        console.log(`   💾 Inserting ${translations.length} translations into database...`);
        try {
          await insertTranslations(translations);
          console.log(`   ✅ Successfully inserted ${translations.length} ${langInfo.name} translations`);
        } catch (error) {
          console.error(`   ❌ Error inserting translations:`, error.message);
        }
      }
    }

    console.log('\n🎉 Translation process complete!');
    console.log('\nSummary:');
    console.log(`   Total English keys: ${englishKeys.length}`);
    console.log(`   Languages processed: ${Object.keys(LANGUAGES).length}`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main();

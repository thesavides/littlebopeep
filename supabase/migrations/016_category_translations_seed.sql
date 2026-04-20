-- Migration 016: Seed category translations for Welsh, Irish, Scottish Gaelic
-- Run in Supabase SQL editor: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/sql/new
-- These are AI-generated translations and are editable via the admin Categories tab.

-- Helper: shared condition set for animals with Looks fine / Stressed / Injured / Dead / Escaped
-- Each UPDATE targets the category by name (safe — names are unique in practice).

-- ─── Sheep ───────────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Defaid","ga":"Caora","gd":"Caora"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Looks fine": "Yn edrych yn iawn",
      "Stressed": "Dan straen",
      "Injured": "Wedi'i anafu",
      "Dead": "Marw",
      "Escaped": "Wedi dianc"
    },
    "ga": {
      "Looks fine": "Cuma mhaith air",
      "Stressed": "Faoi strus",
      "Injured": "Gortaithe",
      "Dead": "Marbh",
      "Escaped": "Éalaithe"
    },
    "gd": {
      "Looks fine": "Coltach gu math",
      "Stressed": "Fo chuideam",
      "Injured": "Leòinte",
      "Dead": "Marbh",
      "Escaped": "Air teicheadh"
    }
  }$t$::jsonb
WHERE name = 'Sheep';

-- ─── Cow ─────────────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Buwch","ga":"Bó","gd":"Bò"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Looks fine": "Yn edrych yn iawn",
      "Stressed": "Dan straen",
      "Injured": "Wedi'i anafu",
      "Dead": "Marw",
      "Escaped": "Wedi dianc"
    },
    "ga": {
      "Looks fine": "Cuma mhaith air",
      "Stressed": "Faoi strus",
      "Injured": "Gortaithe",
      "Dead": "Marbh",
      "Escaped": "Éalaithe"
    },
    "gd": {
      "Looks fine": "Coltach gu math",
      "Stressed": "Fo chuideam",
      "Injured": "Leòinte",
      "Dead": "Marbh",
      "Escaped": "Air teicheadh"
    }
  }$t$::jsonb
WHERE name = 'Cow';

-- ─── Pig ─────────────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Mochyn","ga":"Muc","gd":"Muc"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Looks fine": "Yn edrych yn iawn",
      "Stressed": "Dan straen",
      "Injured": "Wedi'i anafu",
      "Dead": "Marw",
      "Escaped": "Wedi dianc"
    },
    "ga": {
      "Looks fine": "Cuma mhaith air",
      "Stressed": "Faoi strus",
      "Injured": "Gortaithe",
      "Dead": "Marbh",
      "Escaped": "Éalaithe"
    },
    "gd": {
      "Looks fine": "Coltach gu math",
      "Stressed": "Fo chuideam",
      "Injured": "Leòinte",
      "Dead": "Marbh",
      "Escaped": "Air teicheadh"
    }
  }$t$::jsonb
WHERE name = 'Pig';

-- ─── Goat ────────────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Gafr","ga":"Gabhar","gd":"Gobhar"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Looks fine": "Yn edrych yn iawn",
      "Stressed": "Dan straen",
      "Injured": "Wedi'i anafu",
      "Dead": "Marw",
      "Escaped": "Wedi dianc"
    },
    "ga": {
      "Looks fine": "Cuma mhaith air",
      "Stressed": "Faoi strus",
      "Injured": "Gortaithe",
      "Dead": "Marbh",
      "Escaped": "Éalaithe"
    },
    "gd": {
      "Looks fine": "Coltach gu math",
      "Stressed": "Fo chuideam",
      "Injured": "Leòinte",
      "Dead": "Marbh",
      "Escaped": "Air teicheadh"
    }
  }$t$::jsonb
WHERE name = 'Goat';

-- ─── Horse ───────────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Ceffyl","ga":"Capall","gd":"Each"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Looks fine": "Yn edrych yn iawn",
      "Stressed": "Dan straen",
      "Injured": "Wedi'i anafu",
      "Dead": "Marw"
    },
    "ga": {
      "Looks fine": "Cuma mhaith air",
      "Stressed": "Faoi strus",
      "Injured": "Gortaithe",
      "Dead": "Marbh"
    },
    "gd": {
      "Looks fine": "Coltach gu math",
      "Stressed": "Fo chuideam",
      "Injured": "Leòinte",
      "Dead": "Marbh"
    }
  }$t$::jsonb
WHERE name = 'Horse';

-- ─── Chicken ─────────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Iâr","ga":"Sicín","gd":"Cearc"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Crossed the road": "Wedi croesi'r ffordd",
      "Injured": "Wedi'i anafu",
      "Dead": "Marw"
    },
    "ga": {
      "Crossed the road": "Trasnaigh an bóthar",
      "Injured": "Gortaithe",
      "Dead": "Marbh"
    },
    "gd": {
      "Crossed the road": "Chaidh thar an rathaid",
      "Injured": "Leòinte",
      "Dead": "Marbh"
    }
  }$t$::jsonb
WHERE name = 'Chicken';

-- ─── Predator ────────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Ysglyfaethwr","ga":"Creachadóir","gd":"Creachadair"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "In field": "Yn y cae",
      "Near lifestock": "Ger da byw",
      "Nearby": "Gerllaw"
    },
    "ga": {
      "In field": "Sa ghort",
      "Near lifestock": "In aice le beostoic",
      "Nearby": "In aice láimhe"
    },
    "gd": {
      "In field": "Anns an achadh",
      "Near lifestock": "Faisg air sprèidh",
      "Nearby": "Faisg air làimh"
    }
  }$t$::jsonb
WHERE name = 'Predator';

-- ─── Fence / wall ────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Ffens / wal","ga":"Fál / balla","gd":"Feansa / balla"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Broken": "Wedi torri",
      "Fallen down": "Wedi cwympo",
      "Vandalised": "Wedi'i fandaleiddio"
    },
    "ga": {
      "Broken": "Briste",
      "Fallen down": "Titim síos",
      "Vandalised": "Millte"
    },
    "gd": {
      "Broken": "Briste",
      "Fallen down": "Air tuiteam",
      "Vandalised": "Air a mhilleadh"
    }
  }$t$::jsonb
WHERE name = 'Fence / wall';

-- ─── Gate ────────────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Gât","ga":"Geata","gd":"Geata"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Fallen down": "Wedi cwympo",
      "Open": "Agored",
      "Closed": "Ar gau",
      "Damaged": "Wedi'i ddifrodi"
    },
    "ga": {
      "Fallen down": "Titim síos",
      "Open": "Oscailte",
      "Closed": "Dúnta",
      "Damaged": "Damáistithe"
    },
    "gd": {
      "Fallen down": "Air tuiteam",
      "Open": "Fosgailte",
      "Closed": "Dùinte",
      "Damaged": "Air a dhèanamh cron air"
    }
  }$t$::jsonb
WHERE name = 'Gate';

-- ─── Farm equipment ──────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Offer fferm","ga":"Trealamh feirme","gd":"Uidheam tuathanachais"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Abandoned": "Wedi'i adael",
      "Vandalised": "Wedi'i fandaleiddio",
      "Obstruction": "Rhwystr",
      "Leaking": "Yn gollwng"
    },
    "ga": {
      "Abandoned": "Tréigthe",
      "Vandalised": "Millte",
      "Obstruction": "Bacainn",
      "Leaking": "Ag sceitheadh"
    },
    "gd": {
      "Abandoned": "Air a thrèigsinn",
      "Vandalised": "Air a mhilleadh",
      "Obstruction": "Grabadh",
      "Leaking": "A' sruthadh"
    }
  }$t$::jsonb
WHERE name = 'Farm equipment';

-- ─── Tree / shrub ────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Coeden / llwyn","ga":"Crann / tor","gd":"Craobh / preas"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "Fallen down": "Wedi cwympo",
      "Blocking road": "Yn rhwystro'r ffordd",
      "Blocking path": "Yn rhwystro'r llwybr",
      "Damaged property": "Eiddo wedi'i ddifrodi"
    },
    "ga": {
      "Fallen down": "Titim síos",
      "Blocking road": "Ag blocáil an bhóthair",
      "Blocking path": "Ag blocáil an chosáin",
      "Damaged property": "Maoin damáistithe"
    },
    "gd": {
      "Fallen down": "Air tuiteam",
      "Blocking road": "A' bacadh an rathaid",
      "Blocking path": "A' bacadh na ceum",
      "Damaged property": "Cron air cuid-sheilbh"
    }
  }$t$::jsonb
WHERE name = 'Tree / shrub';

-- ─── Fly tipping ─────────────────────────────────────────────────────────────
UPDATE report_categories SET
  name_translations = $t${"cy":"Tipio anghyfreithlon","ga":"Dramhaíl mhídhleathach","gd":"Tilgeil sgudail gu neo-laghail"}$t$::jsonb,
  condition_translations = $t${
    "cy": {
      "On road": "Ar y ffordd",
      "Next to road": "Wrth ymyl y ffordd",
      "In field": "Yn y cae"
    },
    "ga": {
      "On road": "Ar an mbóthar",
      "Next to road": "In aice leis an mbóthar",
      "In field": "Sa ghort"
    },
    "gd": {
      "On road": "Air an rathad",
      "Next to road": "Ri taobh an rathaid",
      "In field": "Anns an achadh"
    }
  }$t$::jsonb
WHERE name = 'Fly tipping';

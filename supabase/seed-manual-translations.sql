-- Manual Translations for Welsh (cy), Irish (ga), and Scottish Gaelic (gd)
-- Generated: January 12, 2026
-- Run this in Supabase SQL Editor after English translations are seeded

-- ==================== WELSH (CYMRAEG) ====================
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  -- Common
  ('common.loading', 'cy', 'Yn llwytho...', 'common', NULL),
  ('common.error', 'cy', 'Gwall', 'common', NULL),
  ('common.success', 'cy', 'Llwyddiant', 'common', NULL),
  ('common.save', 'cy', 'Cadw', 'common', NULL),
  ('common.cancel', 'cy', 'Canslo', 'common', NULL),
  ('common.delete', 'cy', 'Dileu', 'common', NULL),
  ('common.edit', 'cy', 'Golygu', 'common', NULL),
  ('common.close', 'cy', 'Cau', 'common', NULL),
  ('common.confirm', 'cy', 'Cadarnhau', 'common', NULL),
  ('common.back', 'cy', 'Yn ôl', 'common', NULL),
  ('common.next', 'cy', 'Nesaf', 'common', NULL),
  ('common.submit', 'cy', 'Cyflwyno', 'common', NULL),

  -- Header / Navigation
  ('header.appName', 'cy', 'Little Bo Peep', 'navigation', 'Brand name - not translated'),
  ('header.logout', 'cy', 'Allgofnodi', 'navigation', NULL),
  ('header.switchToFarmer', 'cy', 'Newid i Ffermwr', 'navigation', NULL),
  ('header.switchToWalker', 'cy', 'Newid i Gerddwr', 'navigation', NULL),
  ('header.adminAccess', 'cy', 'Mynediad Gweinyddol', 'navigation', NULL),
  ('header.admin', 'cy', 'Gweinyddol', 'navigation', NULL),
  ('header.walkerMode', 'cy', 'Modd Cerddwr', 'navigation', NULL),
  ('header.farmerMode', 'cy', 'Modd Ffermwr', 'navigation', NULL),

  -- Authentication
  ('auth.signIn', 'cy', 'Mewngofnodi', 'auth', NULL),
  ('auth.signUp', 'cy', 'Cofrestru', 'auth', NULL),
  ('auth.email', 'cy', 'E-bost', 'auth', NULL),
  ('auth.password', 'cy', 'Cyfrinair', 'auth', NULL),
  ('auth.confirmPassword', 'cy', 'Cadarnhau Cyfrinair', 'auth', NULL),
  ('auth.name', 'cy', 'Enw', 'auth', NULL),
  ('auth.role', 'cy', 'Rwyf yn...', 'auth', NULL),
  ('auth.walker', 'cy', 'Cerddwr', 'auth', NULL),
  ('auth.farmer', 'cy', 'Ffermwr', 'auth', NULL),
  ('auth.alreadyHaveAccount', 'cy', 'Eisoes â chyfrif?', 'auth', NULL),
  ('auth.dontHaveAccount', 'cy', 'Dim cyfrif gennych?', 'auth', NULL),
  ('auth.createAccount', 'cy', 'Creu Cyfrif', 'auth', NULL),

  -- Home Page
  ('home.welcomeWalker', 'cy', 'Rwy''n Gerddwr', 'home', NULL),
  ('home.welcomeFarmer', 'cy', 'Rwy''n Ffermwr', 'home', NULL),
  ('home.tagline', 'cy', 'Helpu defaid i gyrraedd adref', 'home', NULL),
  ('home.description', 'cy', 'Ffordd syml i gerddwyr cefn gwlad adrodd am ddefaid coll a helpu ffermwyr i adfer eu praidd.', 'home', NULL),
  ('home.registeredUsers', 'cy', '{count} defnyddiwr cofrestredig', 'home', '{count} is a number placeholder'),
  ('home.walkerDescription', 'cy', 'Wedi gweld defaid sy''n edrych ar goll? Adroddwch eu lleoliad a helpu ffermwr i ddod o hyd iddynt.', 'home', NULL),
  ('home.farmerDescription', 'cy', 'Gosodwch eich caeau fferm a derbyn rhybuddion pan welir defaid gerllaw.', 'home', NULL),
  ('home.reportSheepCta', 'cy', 'Adrodd am ddafad →', 'home', NULL),
  ('home.manageFarmCta', 'cy', 'Rheoli fy fferm →', 'home', NULL),
  ('home.adminPasswordPrompt', 'cy', 'Rhowch gyfrinair gweinyddol:', 'home', NULL),
  ('home.incorrectPassword', 'cy', 'Cyfrinair anghywir', 'home', NULL),
  ('home.howItWorks', 'cy', 'Sut mae''n gweithio', 'home', NULL),
  ('home.step1Title', 'cy', 'Gweld', 'home', NULL),
  ('home.step1Description', 'cy', 'Mae cerddwr yn gweld defaid sy''n ymddangos ar goll neu allan o le', 'home', NULL),
  ('home.step2Title', 'cy', 'Adrodd', 'home', NULL),
  ('home.step2Description', 'cy', 'Cyflwyno lleoliad a manylion trwy''r ap', 'home', NULL),
  ('home.step3Title', 'cy', 'Ailuno', 'home', NULL),
  ('home.step3Description', 'cy', 'Mae ffermwr yn derbyn rhybudd ac yn adfer eu defaid', 'home', NULL),
  ('home.stat1', 'cy', 'Defaid yn y DU', 'home', NULL),
  ('home.stat2', 'cy', 'Colledion blynyddol', 'home', NULL),
  ('home.stat3Value', 'cy', 'Am ddim', 'home', NULL),
  ('home.stat3Label', 'cy', 'Treial 30 diwrnod', 'home', NULL),

  -- Walker Dashboard
  ('walker.reportSheep', 'cy', 'Adrodd am Ddefaid', 'walker', NULL),
  ('walker.myReports', 'cy', 'Fy Adroddiadau', 'walker', NULL),
  ('walker.recentAlerts', 'cy', 'Rhybuddion Diweddar', 'walker', NULL),
  ('walker.step1Title', 'cy', 'Ble welsoch chi''r defaid?', 'walker', NULL),
  ('walker.step2Title', 'cy', 'Faint o ddefaid?', 'walker', NULL),
  ('walker.step3Title', 'cy', 'Cyflwr a Manylion', 'walker', NULL),
  ('walker.step4Title', 'cy', 'Gwybodaeth Gyswllt', 'walker', NULL),
  ('walker.clickMap', 'cy', 'Cliciwch ar y map i nodi''r lleoliad', 'walker', NULL),
  ('walker.useMyLocation', 'cy', 'Defnyddio fy lleoliad cyfredol', 'walker', NULL),
  ('walker.sheepCount', 'cy', 'Nifer y defaid', 'walker', NULL),
  ('walker.condition', 'cy', 'Cyflwr', 'walker', NULL),
  ('walker.conditionHealthy', 'cy', 'Iach', 'walker', NULL),
  ('walker.conditionInjured', 'cy', 'Wedi''i anafu', 'walker', NULL),
  ('walker.conditionUnknown', 'cy', 'Anhysbys', 'walker', NULL),
  ('walker.description', 'cy', 'Disgrifiad (dewisol)', 'walker', NULL),
  ('walker.contactEmail', 'cy', 'E-bost Cyswllt', 'walker', NULL),
  ('walker.contactPhone', 'cy', 'Ffôn Cyswllt (dewisol)', 'walker', NULL),
  ('walker.reportSubmitted', 'cy', 'Adroddiad wedi''i Gyflwyno''n Llwyddiannus', 'walker', NULL),
  ('walker.thankYou', 'cy', 'Diolch am helpu i ailuno defaid coll!', 'walker', NULL),

  -- Farmer Dashboard
  ('farmer.dashboard', 'cy', 'Dangosfwrdd', 'farmer', NULL),
  ('farmer.myFarms', 'cy', 'Fy Ffermydd', 'farmer', NULL),
  ('farmer.addFarm', 'cy', 'Ychwanegu Fferm', 'farmer', NULL),
  ('farmer.addField', 'cy', 'Ychwanegu Cae', 'farmer', NULL),
  ('farmer.farmName', 'cy', 'Enw''r Fferm', 'farmer', NULL),
  ('farmer.fieldName', 'cy', 'Enw''r Cae', 'farmer', NULL),
  ('farmer.alertBuffer', 'cy', 'Byffer Rhybudd (metrau)', 'farmer', NULL),
  ('farmer.reports', 'cy', 'Adroddiadau', 'farmer', NULL),
  ('farmer.claimReport', 'cy', 'Hawlio Adroddiad', 'farmer', NULL),
  ('farmer.resolveReport', 'cy', 'Nodi fel wedi''i Ddatrys', 'farmer', NULL),
  ('farmer.reportClaimed', 'cy', 'Adroddiad wedi''i Hawlio', 'farmer', NULL),
  ('farmer.reportResolved', 'cy', 'Adroddiad wedi''i Ddatrys', 'farmer', NULL),
  ('farmer.sheepReunited', 'cy', 'Defaid wedi''u Hailuno!', 'farmer', NULL),

  -- Map
  ('map.layers', 'cy', 'Haenau', 'map', NULL),
  ('map.footpaths', 'cy', 'Llwybrau Troed', 'map', NULL),
  ('map.bridleways', 'cy', 'Llwybrau Ceffyl', 'map', NULL),
  ('map.trails', 'cy', 'Llwybrau', 'map', NULL),
  ('map.contours', 'cy', 'Cyfuchlinau', 'map', NULL),
  ('map.viewDisclaimer', 'cy', 'Gweld ymwadiad', 'map', NULL),
  ('map.disclaimerTitle', 'cy', 'Ymwadiad Hawliau Tramwy', 'map', NULL),
  ('map.disclaimerText1', 'cy', 'Darperir data hawliau tramwy ar gyfer cyfeirio yn unig.', 'map', NULL),
  ('map.disclaimerText2', 'cy', 'Gwnewch yn siŵr eich bod yn gwirio hawliau mynediad gydag awdurdodau lleol. Gall data fod yn anghyflawn neu''n anghywir.', 'map', NULL),
  ('map.disclaimerText3', 'cy', 'Mae defnyddwyr yn gyfrifol am sicrhau mynediad cyfreithlon i bob ardal.', 'map', NULL),
  ('map.iUnderstand', 'cy', 'Rwy''n Deall', 'map', NULL),
  ('map.loadingLayers', 'cy', 'Yn llwytho haenau...', 'map', NULL),

  -- Admin
  ('admin.dashboard', 'cy', 'Dangosfwrdd Gweinyddol', 'admin', NULL),
  ('admin.users', 'cy', 'Defnyddwyr', 'admin', NULL),
  ('admin.allReports', 'cy', 'Pob Adroddiad', 'admin', NULL),
  ('admin.statistics', 'cy', 'Ystadegau', 'admin', NULL),
  ('admin.archiveReport', 'cy', 'Archifo Adroddiad', 'admin', NULL),

  -- Report Status
  ('status.reported', 'cy', 'Wedi Adrodd', 'reports', NULL),
  ('status.claimed', 'cy', 'Wedi Hawlio', 'reports', NULL),
  ('status.resolved', 'cy', 'Wedi Datrys', 'reports', NULL),
  ('reports.sheepCount', 'cy', '{count} dafad', 'reports', '{count} is a number placeholder'),
  ('reports.timestamp', 'cy', 'Adroddwyd {time}', 'reports', '{time} is a relative time'),

  -- Errors
  ('error.generic', 'cy', 'Aeth rhywbeth o''i le. Rhowch gynnig arall arni.', 'errors', NULL),
  ('error.network', 'cy', 'Gwall rhwydwaith. Gwiriwch eich cysylltiad.', 'errors', NULL),
  ('error.unauthorized', 'cy', 'Nid ydych wedi''ch awdurdodi i wneud y weithred hon.', 'errors', NULL),
  ('error.notFound', 'cy', 'Ni chanfuwyd yr adnodd a ofynnwyd amdano.', 'errors', NULL)
ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  namespace = EXCLUDED.namespace,
  context = EXCLUDED.context,
  updated_at = NOW();

-- Mark as AI-generated (manually translated for now)
INSERT INTO translation_metadata (translation_key, language_code, is_ai_generated, is_verified)
SELECT key, 'cy', false, false FROM translations WHERE language_code = 'cy'
ON CONFLICT (translation_key, language_code) DO UPDATE SET
  is_ai_generated = false,
  is_verified = false;

-- ==================== IRISH (GAEILGE) ====================
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  -- Common
  ('common.loading', 'ga', 'Ag lódáil...', 'common', NULL),
  ('common.error', 'ga', 'Earráid', 'common', NULL),
  ('common.success', 'ga', 'Rath', 'common', NULL),
  ('common.save', 'ga', 'Sábháil', 'common', NULL),
  ('common.cancel', 'ga', 'Cealaigh', 'common', NULL),
  ('common.delete', 'ga', 'Scrios', 'common', NULL),
  ('common.edit', 'ga', 'Cuir in eagar', 'common', NULL),
  ('common.close', 'ga', 'Dún', 'common', NULL),
  ('common.confirm', 'ga', 'Deimhnigh', 'common', NULL),
  ('common.back', 'ga', 'Ar ais', 'common', NULL),
  ('common.next', 'ga', 'Ar aghaidh', 'common', NULL),
  ('common.submit', 'ga', 'Cuir isteach', 'common', NULL),

  -- Header / Navigation
  ('header.appName', 'ga', 'Little Bo Peep', 'navigation', 'Brand name - not translated'),
  ('header.logout', 'ga', 'Logáil Amach', 'navigation', NULL),
  ('header.switchToFarmer', 'ga', 'Athraigh go Feirmeoir', 'navigation', NULL),
  ('header.switchToWalker', 'ga', 'Athraigh go Siúlóir', 'navigation', NULL),
  ('header.adminAccess', 'ga', 'Rochtain Riaracháin', 'navigation', NULL),
  ('header.admin', 'ga', 'Riarach án', 'navigation', NULL),
  ('header.walkerMode', 'ga', 'Mód Siúlóra', 'navigation', NULL),
  ('header.farmerMode', 'ga', 'Mód Feirmeoiraeoire', 'navigation', NULL),

  -- Authentication
  ('auth.signIn', 'ga', 'Logáil Isteach', 'auth', NULL),
  ('auth.signUp', 'ga', 'Cláraigh', 'auth', NULL),
  ('auth.email', 'ga', 'Ríomhphost', 'auth', NULL),
  ('auth.password', 'ga', 'Pasfhocal', 'auth', NULL),
  ('auth.confirmPassword', 'ga', 'Deimhnigh Pasfhocal', 'auth', NULL),
  ('auth.name', 'ga', 'Ainm', 'auth', NULL),
  ('auth.role', 'ga', 'Is mise...', 'auth', NULL),
  ('auth.walker', 'ga', 'Siúlóir', 'auth', NULL),
  ('auth.farmer', 'ga', 'Feirmeoir', 'auth', NULL),
  ('auth.alreadyHaveAccount', 'ga', 'An bhfuil cuntas agat cheana?', 'auth', NULL),
  ('auth.dontHaveAccount', 'ga', 'Níl cuntas agat?', 'auth', NULL),
  ('auth.createAccount', 'ga', 'Cruthaigh Cuntas', 'auth', NULL),

  -- Home Page
  ('home.welcomeWalker', 'ga', 'Is Siúlóir Mé', 'home', NULL),
  ('home.welcomeFarmer', 'ga', 'Is Feirmeoir Mé', 'home', NULL),
  ('home.tagline', 'ga', 'Ag cabhrú le caoirigh teacht abhaile', 'home', NULL),
  ('home.description', 'ga', 'Bealach simplí do shiúlóirí tuaithe chun caoirigh chaillte a thuairisciú agus cabhrú le feirmeoirí a dtréad a aisghabháil.', 'home', NULL),
  ('home.registeredUsers', 'ga', '{count} úsáideoir cláraithe', 'home', '{count} is a number placeholder'),
  ('home.walkerDescription', 'ga', 'An bhfaca tú caoirigh a fhéachann ar strae? Tuairiscigh a suíomh agus cabhraigh le feirmeoir iad a aimsiú.', 'home', NULL),
  ('home.farmerDescription', 'ga', 'Socraigh do pháirceanna feirme agus faigh foláirimh nuair a fheictear caoirigh in aice láimhe.', 'home', NULL),
  ('home.reportSheepCta', 'ga', 'Tuairiscigh caora →', 'home', NULL),
  ('home.manageFarmCta', 'ga', 'Bainistigh mo fheirm →', 'home', NULL),
  ('home.adminPasswordPrompt', 'ga', 'Iontráil pasfhocal riaracháin:', 'home', NULL),
  ('home.incorrectPassword', 'ga', 'Pasfhocal mícheart', 'home', NULL),
  ('home.howItWorks', 'ga', 'Conas a oibríonn sé', 'home', NULL),
  ('home.step1Title', 'ga', 'Aimsigh', 'home', NULL),
  ('home.step1Description', 'ga', 'Aimsíonn siúlóir caoirigh a fhéachann caillte nó as áit', 'home', NULL),
  ('home.step2Title', 'ga', 'Tuairiscigh', 'home', NULL),
  ('home.step2Description', 'ga', 'Cuir isteach suíomh agus sonraí tríd an aip', 'home', NULL),
  ('home.step3Title', 'ga', 'Athchuir', 'home', NULL),
  ('home.step3Description', 'ga', 'Faigheann feirmeoir foláireamh agus aisghabháileann sé a chaoirigh', 'home', NULL),
  ('home.stat1', 'ga', 'Caoirigh sa RA', 'home', NULL),
  ('home.stat2', 'ga', 'Caillteanais bhliantúla', 'home', NULL),
  ('home.stat3Value', 'ga', 'Saor in aisce', 'home', NULL),
  ('home.stat3Label', 'ga', 'Triail 30 lá', 'home', NULL),

  -- Walker Dashboard
  ('walker.reportSheep', 'ga', 'Tuairiscigh Caoirigh', 'walker', NULL),
  ('walker.myReports', 'ga', 'Mo Thuairiscí', 'walker', NULL),
  ('walker.recentAlerts', 'ga', 'Foláirimh Le Déanaí', 'walker', NULL),
  ('walker.step1Title', 'ga', 'Cá bhfaca tú na caoirigh?', 'walker', NULL),
  ('walker.step2Title', 'ga', 'Cé mhéad caora?', 'walker', NULL),
  ('walker.step3Title', 'ga', 'Riocht agus Sonraí', 'walker', NULL),
  ('walker.step4Title', 'ga', 'Faisnéis Teagmhála', 'walker', NULL),
  ('walker.clickMap', 'ga', 'Cliceáil ar an léarscáil chun an suíomh a mharcáil', 'walker', NULL),
  ('walker.useMyLocation', 'ga', 'Úsáid mo shuíomh reatha', 'walker', NULL),
  ('walker.sheepCount', 'ga', 'Líon na gcaorach', 'walker', NULL),
  ('walker.condition', 'ga', 'Riocht', 'walker', NULL),
  ('walker.conditionHealthy', 'ga', 'Sláintiúil', 'walker', NULL),
  ('walker.conditionInjured', 'ga', 'Gortaithe', 'walker', NULL),
  ('walker.conditionUnknown', 'ga', 'Anaithnid', 'walker', NULL),
  ('walker.description', 'ga', 'Cur síos (roghnach)', 'walker', NULL),
  ('walker.contactEmail', 'ga', 'Ríomhphost Teagmhála', 'walker', NULL),
  ('walker.contactPhone', 'ga', 'Fón Teagmhála (roghnach)', 'walker', NULL),
  ('walker.reportSubmitted', 'ga', 'Tuairisc Curtha Isteach go Rathúil', 'walker', NULL),
  ('walker.thankYou', 'ga', 'Go raibh maith agat as cabhrú le caoirigh chaillte a athchuir!', 'walker', NULL),

  -- Farmer Dashboard
  ('farmer.dashboard', 'ga', 'Deais', 'farmer', NULL),
  ('farmer.myFarms', 'ga', 'Mo Fheirmeannaí', 'farmer', NULL),
  ('farmer.addFarm', 'ga', 'Cuir Feirm Leis', 'farmer', NULL),
  ('farmer.addField', 'ga', 'Cuir Páirc Leis', 'farmer', NULL),
  ('farmer.farmName', 'ga', 'Ainm na Feirme', 'farmer', NULL),
  ('farmer.fieldName', 'ga', 'Ainm na Páirce', 'farmer', NULL),
  ('farmer.alertBuffer', 'ga', 'Maolán Foláirimh (méadair)', 'farmer', NULL),
  ('farmer.reports', 'ga', 'Tuairiscí', 'farmer', NULL),
  ('farmer.claimReport', 'ga', 'Éiligh Tuairisc', 'farmer', NULL),
  ('farmer.resolveReport', 'ga', 'Marcáil mar Réitithe', 'farmer', NULL),
  ('farmer.reportClaimed', 'ga', 'Tuairisc Éilithe', 'farmer', NULL),
  ('farmer.reportResolved', 'ga', 'Tuairisc Réitithe', 'farmer', NULL),
  ('farmer.sheepReunited', 'ga', 'Caoirigh Athchuir the!', 'farmer', NULL),

  -- Map
  ('map.layers', 'ga', 'Sraitheanna', 'map', NULL),
  ('map.footpaths', 'ga', 'Cosáin Troide', 'map', NULL),
  ('map.bridleways', 'ga', 'Bóithre Capall', 'map', NULL),
  ('map.trails', 'ga', 'Cosáin', 'map', NULL),
  ('map.contours', 'ga', 'Comhshínteáin', 'map', NULL),
  ('map.viewDisclaimer', 'ga', 'Féach séanadh', 'map', NULL),
  ('map.disclaimerTitle', 'ga', 'Séanadh Cearta Slí', 'map', NULL),
  ('map.disclaimerText1', 'ga', 'Cuirtear sonraí cearta slí ar fáil le haghaidh tagartha amháin.', 'map', NULL),
  ('map.disclaimerText2', 'ga', 'Deimhnigh cearta rochtana le húdaráis áitiúla i gcónaí. D''fhéadfadh go mbeadh sonraí neamhiomlán nó mícheart.', 'map', NULL),
  ('map.disclaimerText3', 'ga', 'Tá úsáideoirí freagrach as rochtain dhleathach a chinntiú ar gach ceantar.', 'map', NULL),
  ('map.iUnderstand', 'ga', 'Tuigim', 'map', NULL),
  ('map.loadingLayers', 'ga', 'Ag lódáil sraitheanna...', 'map', NULL),

  -- Admin
  ('admin.dashboard', 'ga', 'Deais Riaracháin', 'admin', NULL),
  ('admin.users', 'ga', 'Úsáideoirí', 'admin', NULL),
  ('admin.allReports', 'ga', 'Gach Tuairisc', 'admin', NULL),
  ('admin.statistics', 'ga', 'Staitisticí', 'admin', NULL),
  ('admin.archiveReport', 'ga', 'Cartlannú Tuairisc', 'admin', NULL),

  -- Report Status
  ('status.reported', 'ga', 'Tuairiscthe', 'reports', NULL),
  ('status.claimed', 'ga', 'Éilithe', 'reports', NULL),
  ('status.resolved', 'ga', 'Réitithe', 'reports', NULL),
  ('reports.sheepCount', 'ga', '{count} caora', 'reports', '{count} is a number placeholder'),
  ('reports.timestamp', 'ga', 'Tuairiscthe {time}', 'reports', '{time} is a relative time'),

  -- Errors
  ('error.generic', 'ga', 'Chuaigh rud éigin mícheart. Bain triail eile as.', 'errors', NULL),
  ('error.network', 'ga', 'Earráid líonra. Seiceáil do nasc.', 'errors', NULL),
  ('error.unauthorized', 'ga', 'Níl tú údaraithe an gníomh seo a dhéanamh.', 'errors', NULL),
  ('error.notFound', 'ga', 'Níor aimsíodh an acmhainn a iarradh.', 'errors', NULL)
ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  namespace = EXCLUDED.namespace,
  context = EXCLUDED.context,
  updated_at = NOW();

-- Mark metadata
INSERT INTO translation_metadata (translation_key, language_code, is_ai_generated, is_verified)
SELECT key, 'ga', false, false FROM translations WHERE language_code = 'ga'
ON CONFLICT (translation_key, language_code) DO UPDATE SET
  is_ai_generated = false,
  is_verified = false;

-- ==================== SCOTTISH GAELIC (GÀIDHLIG) ====================
INSERT INTO translations (key, language_code, value, namespace, context) VALUES
  -- Common
  ('common.loading', 'gd', 'A'' luchdachadh...', 'common', NULL),
  ('common.error', 'gd', 'Mearachd', 'common', NULL),
  ('common.success', 'gd', 'Soirbheachas', 'common', NULL),
  ('common.save', 'gd', 'Sàbhail', 'common', NULL),
  ('common.cancel', 'gd', 'Sguir dheth', 'common', NULL),
  ('common.delete', 'gd', 'Dubh às', 'common', NULL),
  ('common.edit', 'gd', 'Deasaich', 'common', NULL),
  ('common.close', 'gd', 'Dùin', 'common', NULL),
  ('common.confirm', 'gd', 'Dearbhaich', 'common', NULL),
  ('common.back', 'gd', 'Air ais', 'common', NULL),
  ('common.next', 'gd', 'Air adhart', 'common', NULL),
  ('common.submit', 'gd', 'Cuir a-steach', 'common', NULL),

  -- Header / Navigation
  ('header.appName', 'gd', 'Little Bo Peep', 'navigation', 'Brand name - not translated'),
  ('header.logout', 'gd', 'Log a-mach', 'navigation', NULL),
  ('header.switchToFarmer', 'gd', 'Atharraich gu Tuathanach', 'navigation', NULL),
  ('header.switchToWalker', 'gd', 'Atharraich gu Coisiche', 'navigation', NULL),
  ('header.adminAccess', 'gd', 'Inntrigeadh Rianachd', 'navigation', NULL),
  ('header.admin', 'gd', 'Rianachd', 'navigation', NULL),
  ('header.walkerMode', 'gd', 'Modh Coisiche', 'navigation', NULL),
  ('header.farmerMode', 'gd', 'Modh Tuathanaich', 'navigation', NULL),

  -- Authentication
  ('auth.signIn', 'gd', 'Log a-steach', 'auth', NULL),
  ('auth.signUp', 'gd', 'Clàraich', 'auth', NULL),
  ('auth.email', 'gd', 'Post-d', 'auth', NULL),
  ('auth.password', 'gd', 'Facal-faire', 'auth', NULL),
  ('auth.confirmPassword', 'gd', 'Dearbhaich Facal-faire', 'auth', NULL),
  ('auth.name', 'gd', 'Ainm', 'auth', NULL),
  ('auth.role', 'gd', '''S mise...', 'auth', NULL),
  ('auth.walker', 'gd', 'Coisiche', 'auth', NULL),
  ('auth.farmer', 'gd', 'Tuathanach', 'auth', NULL),
  ('auth.alreadyHaveAccount', 'gd', 'A bheil cunntas agad mu thràth?', 'auth', NULL),
  ('auth.dontHaveAccount', 'gd', 'Nach eil cunntas agad?', 'auth', NULL),
  ('auth.createAccount', 'gd', 'Cruthaich Cunntas', 'auth', NULL),

  -- Home Page
  ('home.welcomeWalker', 'gd', '''S e Coisiche a th'' annam', 'home', NULL),
  ('home.welcomeFarmer', 'gd', '''S e Tuathanach a th'' annam', 'home', NULL),
  ('home.tagline', 'gd', 'A'' cuideachadh caoraich a dhol dhachaigh', 'home', NULL),
  ('home.description', 'gd', 'Dòigh shìmplidh do luchd-coiseachd dùthchail caoraich air chall aithris agus cuideachadh le tuathanaich an treud ath-fhaighinn.', 'home', NULL),
  ('home.registeredUsers', 'gd', '{count} cleachdaiche clàraichte', 'home', '{count} is a number placeholder'),
  ('home.walkerDescription', 'gd', 'An fhaca tu caoraich a tha coltach ri bhith air chall? Thoir aithris air an àite agus cuidich tuathanach gan lorg.', 'home', NULL),
  ('home.farmerDescription', 'gd', 'Suidhich na raointean tuathanais agad agus faigh rabhaidhean nuair a chithear caoraich faisg air làimh.', 'home', NULL),
  ('home.reportSheepCta', 'gd', 'Thoir aithris air caora →', 'home', NULL),
  ('home.manageFarmCta', 'gd', 'Stiùir an tuathanas agam →', 'home', NULL),
  ('home.adminPasswordPrompt', 'gd', 'Cuir a-steach facal-faire rianachd:', 'home', NULL),
  ('home.incorrectPassword', 'gd', 'Facal-faire ceàrr', 'home', NULL),
  ('home.howItWorks', 'gd', 'Mar a dh''obraicheas e', 'home', NULL),
  ('home.step1Title', 'gd', 'Lorg', 'home', NULL),
  ('home.step1Description', 'gd', 'Lorgaidh coisiche caoraich a tha coltach ri bhith air chall no às àite', 'home', NULL),
  ('home.step2Title', 'gd', 'Thoir Aithris', 'home', NULL),
  ('home.step2Description', 'gd', 'Cuir a-steach àite agus mion-fhiosrachadh tron aplacaid', 'home', NULL),
  ('home.step3Title', 'gd', 'Ath-aonaich', 'home', NULL),
  ('home.step3Description', 'gd', 'Gheibh tuathanach rabhadh agus ath-ghlacaidh e na caoraich aca', 'home', NULL),
  ('home.stat1', 'gd', 'Caoraich san RA', 'home', NULL),
  ('home.stat2', 'gd', 'Call bliadhnail', 'home', NULL),
  ('home.stat3Value', 'gd', 'An-asgaidh', 'home', NULL),
  ('home.stat3Label', 'gd', 'Deuchainn 30 latha', 'home', NULL),

  -- Walker Dashboard
  ('walker.reportSheep', 'gd', 'Thoir Aithris air Caoraich', 'walker', NULL),
  ('walker.myReports', 'gd', 'Na h-Aithrisean Agam', 'walker', NULL),
  ('walker.recentAlerts', 'gd', 'Rabhaidhean O Chionn Ghoirid', 'walker', NULL),
  ('walker.step1Title', 'gd', 'Càite an fhaca tu na caoraich?', 'walker', NULL),
  ('walker.step2Title', 'gd', 'Cia mheud caora?', 'walker', NULL),
  ('walker.step3Title', 'gd', 'Cor agus Mion-fhiosrachadh', 'walker', NULL),
  ('walker.step4Title', 'gd', 'Fiosrachadh Conaltraidh', 'walker', NULL),
  ('walker.clickMap', 'gd', 'Briog air a'' mhapa gus an àite a chomharrachadh', 'walker', NULL),
  ('walker.useMyLocation', 'gd', 'Cleachd an t-àite agam an-dràsta', 'walker', NULL),
  ('walker.sheepCount', 'gd', 'Àireamh nan caorach', 'walker', NULL),
  ('walker.condition', 'gd', 'Cor', 'walker', NULL),
  ('walker.conditionHealthy', 'gd', 'Slàn', 'walker', NULL),
  ('walker.conditionInjured', 'gd', 'Air a leòn', 'walker', NULL),
  ('walker.conditionUnknown', 'gd', 'Neo-aithnichte', 'walker', NULL),
  ('walker.description', 'gd', 'Tuairisgeul (roghainneil)', 'walker', NULL),
  ('walker.contactEmail', 'gd', 'Post-d Conaltraidh', 'walker', NULL),
  ('walker.contactPhone', 'gd', 'Fòn Conaltraidh (roghainneil)', 'walker', NULL),
  ('walker.reportSubmitted', 'gd', 'Aithris Air a Cur a-steach gu Soirbheachail', 'walker', NULL),
  ('walker.thankYou', 'gd', 'Tapadh leat airson cuideachadh le caoraich air chall ath-aonadh!', 'walker', NULL),

  -- Farmer Dashboard
  ('farmer.dashboard', 'gd', 'Deas-bhòrd', 'farmer', NULL),
  ('farmer.myFarms', 'gd', 'Na Tuathanasan Agam', 'farmer', NULL),
  ('farmer.addFarm', 'gd', 'Cuir Tuathanas Ris', 'farmer', NULL),
  ('farmer.addField', 'gd', 'Cuir Raon Ris', 'farmer', NULL),
  ('farmer.farmName', 'gd', 'Ainm an Tuathanais', 'farmer', NULL),
  ('farmer.fieldName', 'gd', 'Ainm an Raoin', 'farmer', NULL),
  ('farmer.alertBuffer', 'gd', 'Bufair Rabhaidh (meatairean)', 'farmer', NULL),
  ('farmer.reports', 'gd', 'Aithrisean', 'farmer', NULL),
  ('farmer.claimReport', 'gd', 'Tagair Aithris', 'farmer', NULL),
  ('farmer.resolveReport', 'gd', 'Comharraich mar air a Rèiteachadh', 'farmer', NULL),
  ('farmer.reportClaimed', 'gd', 'Aithris Air a Tagairt', 'farmer', NULL),
  ('farmer.reportResolved', 'gd', 'Aithris Air a Rèiteachadh', 'farmer', NULL),
  ('farmer.sheepReunited', 'gd', 'Caoraich Air an Ath-aonadh!', 'farmer', NULL),

  -- Map
  ('map.layers', 'gd', 'Sreathan', 'map', NULL),
  ('map.footpaths', 'gd', 'Slighean-coise', 'map', NULL),
  ('map.bridleways', 'gd', 'Rathaidean Each', 'map', NULL),
  ('map.trails', 'gd', 'Slighean', 'map', NULL),
  ('map.contours', 'gd', 'Loidhnichean-comhairteachais', 'map', NULL),
  ('map.viewDisclaimer', 'gd', 'Seall àicheadh', 'map', NULL),
  ('map.disclaimerTitle', 'gd', 'Àicheadh Còraichean-rathaid', 'map', NULL),
  ('map.disclaimerText1', 'gd', 'Tha dàta còraichean-rathaid air a thoirt seachad airson iomradh a-mhàin.', 'map', NULL),
  ('map.disclaimerText2', 'gd', 'Dearbhaich còraichean inntrigidh le ùghdarrasan ionadail an-còmhnaidh. Dh''fhaodadh dàta a bhith neo-choileanta no mearachdach.', 'map', NULL),
  ('map.disclaimerText3', 'gd', 'Tha luchd-cleachdaidh cunntachail airson inntrigeadh laghail a dhèanamh cinnteach dhan a h-uile àite.', 'map', NULL),
  ('map.iUnderstand', 'gd', 'Tha mi a'' tuigsinn', 'map', NULL),
  ('map.loadingLayers', 'gd', 'A'' luchdachadh shreathan...', 'map', NULL),

  -- Admin
  ('admin.dashboard', 'gd', 'Deas-bhòrd Rianachd', 'admin', NULL),
  ('admin.users', 'gd', 'Luchd-cleachdaidh', 'admin', NULL),
  ('admin.allReports', 'gd', 'Gach Aithris', 'admin', NULL),
  ('admin.statistics', 'gd', 'Staitistig', 'admin', NULL),
  ('admin.archiveReport', 'gd', 'Tasglannaich Aithris', 'admin', NULL),

  -- Report Status
  ('status.reported', 'gd', 'Air Aithris', 'reports', NULL),
  ('status.claimed', 'gd', 'Air a Tagairt', 'reports', NULL),
  ('status.resolved', 'gd', 'Air a Rèiteachadh', 'reports', NULL),
  ('reports.sheepCount', 'gd', '{count} caora', 'reports', '{count} is a number placeholder'),
  ('reports.timestamp', 'gd', 'Air aithris {time}', 'reports', '{time} is a relative time'),

  -- Errors
  ('error.generic', 'gd', 'Chaidh rudeigin ceàrr. Feuch a-rithist.', 'errors', NULL),
  ('error.network', 'gd', 'Mearachd lìonra. Thoir sùil air do cheangal.', 'errors', NULL),
  ('error.unauthorized', 'gd', 'Chan eil ùghdarras agad an gnìomh seo a dhèanamh.', 'errors', NULL),
  ('error.notFound', 'gd', 'Cha deach an goireas a chaidh iarraidh a lorg.', 'errors', NULL)
ON CONFLICT (key, language_code) DO UPDATE SET
  value = EXCLUDED.value,
  namespace = EXCLUDED.namespace,
  context = EXCLUDED.context,
  updated_at = NOW();

-- Mark metadata
INSERT INTO translation_metadata (translation_key, language_code, is_ai_generated, is_verified)
SELECT key, 'gd', false, false FROM translations WHERE language_code = 'gd'
ON CONFLICT (translation_key, language_code) DO UPDATE SET
  is_ai_generated = false,
  is_verified = false;

-- Verify translations
SELECT
  language_code,
  COUNT(*) as translation_count,
  COUNT(DISTINCT namespace) as namespace_count
FROM translations
GROUP BY language_code
ORDER BY language_code;

const ENDPOINT = process.env["AZURE_LANGUAGE_ENDPOINT"] || "";
const KEY = process.env["AZURE_LANGUAGE_KEY"] || "";
const PROJECT_NAME = "literaku-voice";
const DEPLOYMENT_NAME = "production";
const API_VERSION = "2023-04-01";

if (!ENDPOINT || !KEY) {
  console.error("Missing AZURE_LANGUAGE_ENDPOINT or AZURE_LANGUAGE_KEY");
  process.exit(1);
}

const headers: Record<string, string> = {
  "Ocp-Apim-Subscription-Key": KEY,
  "Content-Type": "application/json",
};

const projectData = {
  projectFileVersion: "2022-10-01-preview",
  stringIndexType: "Utf16CodeUnit",
  metadata: {
    projectKind: "Conversation",
    projectName: PROJECT_NAME,
    settings: { confidenceThreshold: 0.5 },
    multilingual: true,
    language: "en-us",
    description: "Literaku voice command understanding (EN + ID bilingual)",
  },
  assets: {
    projectKind: "Conversation",
    intents: [
      { category: "nav_home" },
      { category: "nav_explorer" },
      { category: "nav_collection" },
      { category: "nav_history" },
      { category: "nav_guide" },
      { category: "nav_settings" },
      { category: "nav_join_institution" },
      { category: "nav_back" },
      { category: "reader_play" },
      { category: "reader_pause" },
      { category: "reader_next" },
      { category: "reader_prev" },
      { category: "search_book" },
      { category: "open_book" },
      { category: "speed_change" },
      { category: "None" },
    ],
    entities: [
      { category: "book_title", compositionSetting: "combineComponents", list: null, prebuilts: null },
      { category: "search_query", compositionSetting: "combineComponents", list: null, prebuilts: null },
      { category: "speed_value", compositionSetting: "combineComponents", list: null, prebuilts: null },
    ],
    utterances: [
      { text: "go home", language: "en-us", intent: "nav_home", entities: [] },
      { text: "go to home", language: "en-us", intent: "nav_home", entities: [] },
      { text: "back to home", language: "en-us", intent: "nav_home", entities: [] },
      { text: "home page", language: "en-us", intent: "nav_home", entities: [] },
      { text: "take me home", language: "en-us", intent: "nav_home", entities: [] },
      { text: "main page", language: "en-us", intent: "nav_home", entities: [] },
      { text: "go back home", language: "en-us", intent: "nav_home", entities: [] },
      { text: "ke beranda", language: "id", intent: "nav_home", entities: [] },
      { text: "beranda", language: "id", intent: "nav_home", entities: [] },
      { text: "pulang", language: "id", intent: "nav_home", entities: [] },
      { text: "kembali ke beranda", language: "id", intent: "nav_home", entities: [] },
      { text: "halaman utama", language: "id", intent: "nav_home", entities: [] },
      { text: "balik ke home", language: "id", intent: "nav_home", entities: [] },

      { text: "open explorer", language: "en-us", intent: "nav_explorer", entities: [] },
      { text: "explore books", language: "en-us", intent: "nav_explorer", entities: [] },
      { text: "browse books", language: "en-us", intent: "nav_explorer", entities: [] },
      { text: "find books", language: "en-us", intent: "nav_explorer", entities: [] },
      { text: "discover new books", language: "en-us", intent: "nav_explorer", entities: [] },
      { text: "show me books", language: "en-us", intent: "nav_explorer", entities: [] },
      { text: "what books are available", language: "en-us", intent: "nav_explorer", entities: [] },
      { text: "explorer", language: "en-us", intent: "nav_explorer", entities: [] },
      { text: "buka penjelajah", language: "id", intent: "nav_explorer", entities: [] },
      { text: "penjelajah", language: "id", intent: "nav_explorer", entities: [] },
      { text: "jelajahi buku", language: "id", intent: "nav_explorer", entities: [] },
      { text: "cari buku baru", language: "id", intent: "nav_explorer", entities: [] },
      { text: "lihat buku", language: "id", intent: "nav_explorer", entities: [] },
      { text: "buku apa saja yang ada", language: "id", intent: "nav_explorer", entities: [] },
      { text: "mau jelajah", language: "id", intent: "nav_explorer", entities: [] },

      { text: "show my collection", language: "en-us", intent: "nav_collection", entities: [] },
      { text: "my books", language: "en-us", intent: "nav_collection", entities: [] },
      { text: "open collection", language: "en-us", intent: "nav_collection", entities: [] },
      { text: "my library", language: "en-us", intent: "nav_collection", entities: [] },
      { text: "saved books", language: "en-us", intent: "nav_collection", entities: [] },
      { text: "reading list", language: "en-us", intent: "nav_collection", entities: [] },
      { text: "collection", language: "en-us", intent: "nav_collection", entities: [] },
      { text: "buka koleksi", language: "id", intent: "nav_collection", entities: [] },
      { text: "koleksi saya", language: "id", intent: "nav_collection", entities: [] },
      { text: "koleksi", language: "id", intent: "nav_collection", entities: [] },
      { text: "buku saya", language: "id", intent: "nav_collection", entities: [] },
      { text: "perpustakaan", language: "id", intent: "nav_collection", entities: [] },
      { text: "daftar bacaan", language: "id", intent: "nav_collection", entities: [] },
      { text: "lihat koleksi", language: "id", intent: "nav_collection", entities: [] },

      { text: "open history", language: "en-us", intent: "nav_history", entities: [] },
      { text: "reading history", language: "en-us", intent: "nav_history", entities: [] },
      { text: "what have I read", language: "en-us", intent: "nav_history", entities: [] },
      { text: "recent books", language: "en-us", intent: "nav_history", entities: [] },
      { text: "history", language: "en-us", intent: "nav_history", entities: [] },
      { text: "show history", language: "en-us", intent: "nav_history", entities: [] },
      { text: "buka riwayat", language: "id", intent: "nav_history", entities: [] },
      { text: "riwayat", language: "id", intent: "nav_history", entities: [] },
      { text: "riwayat bacaan", language: "id", intent: "nav_history", entities: [] },
      { text: "buku yang pernah dibaca", language: "id", intent: "nav_history", entities: [] },
      { text: "lihat riwayat", language: "id", intent: "nav_history", entities: [] },
      { text: "terakhir dibaca", language: "id", intent: "nav_history", entities: [] },

      { text: "open guide", language: "en-us", intent: "nav_guide", entities: [] },
      { text: "help", language: "en-us", intent: "nav_guide", entities: [] },
      { text: "voice guide", language: "en-us", intent: "nav_guide", entities: [] },
      { text: "how to use", language: "en-us", intent: "nav_guide", entities: [] },
      { text: "show me how", language: "en-us", intent: "nav_guide", entities: [] },
      { text: "what can I say", language: "en-us", intent: "nav_guide", entities: [] },
      { text: "buka panduan", language: "id", intent: "nav_guide", entities: [] },
      { text: "panduan", language: "id", intent: "nav_guide", entities: [] },
      { text: "bantuan", language: "id", intent: "nav_guide", entities: [] },
      { text: "cara pakai", language: "id", intent: "nav_guide", entities: [] },
      { text: "gimana caranya", language: "id", intent: "nav_guide", entities: [] },

      { text: "open settings", language: "en-us", intent: "nav_settings", entities: [] },
      { text: "settings", language: "en-us", intent: "nav_settings", entities: [] },
      { text: "preferences", language: "en-us", intent: "nav_settings", entities: [] },
      { text: "change settings", language: "en-us", intent: "nav_settings", entities: [] },
      { text: "adjust voice", language: "en-us", intent: "nav_settings", entities: [] },
      { text: "buka pengaturan", language: "id", intent: "nav_settings", entities: [] },
      { text: "pengaturan", language: "id", intent: "nav_settings", entities: [] },
      { text: "setelan", language: "id", intent: "nav_settings", entities: [] },
      { text: "atur suara", language: "id", intent: "nav_settings", entities: [] },
      { text: "ubah pengaturan", language: "id", intent: "nav_settings", entities: [] },

      { text: "join institution", language: "en-us", intent: "nav_join_institution", entities: [] },
      { text: "join my school", language: "en-us", intent: "nav_join_institution", entities: [] },
      { text: "connect to school", language: "en-us", intent: "nav_join_institution", entities: [] },
      { text: "institution", language: "en-us", intent: "nav_join_institution", entities: [] },
      { text: "school books", language: "en-us", intent: "nav_join_institution", entities: [] },
      { text: "books from school", language: "en-us", intent: "nav_join_institution", entities: [] },
      { text: "gabung institusi", language: "id", intent: "nav_join_institution", entities: [] },
      { text: "institusi", language: "id", intent: "nav_join_institution", entities: [] },
      { text: "sekolah saya", language: "id", intent: "nav_join_institution", entities: [] },
      { text: "buku dari sekolah", language: "id", intent: "nav_join_institution", entities: [] },
      { text: "gabung sekolah", language: "id", intent: "nav_join_institution", entities: [] },
      { text: "hubungkan sekolah", language: "id", intent: "nav_join_institution", entities: [] },

      { text: "go back", language: "en-us", intent: "nav_back", entities: [] },
      { text: "back", language: "en-us", intent: "nav_back", entities: [] },
      { text: "return", language: "en-us", intent: "nav_back", entities: [] },
      { text: "previous page", language: "en-us", intent: "nav_back", entities: [] },
      { text: "go to previous", language: "en-us", intent: "nav_back", entities: [] },
      { text: "kembali", language: "id", intent: "nav_back", entities: [] },
      { text: "balik", language: "id", intent: "nav_back", entities: [] },
      { text: "mundur", language: "id", intent: "nav_back", entities: [] },
      { text: "ke belakang", language: "id", intent: "nav_back", entities: [] },

      { text: "play", language: "en-us", intent: "reader_play", entities: [] },
      { text: "start reading", language: "en-us", intent: "reader_play", entities: [] },
      { text: "continue", language: "en-us", intent: "reader_play", entities: [] },
      { text: "resume", language: "en-us", intent: "reader_play", entities: [] },
      { text: "read to me", language: "en-us", intent: "reader_play", entities: [] },
      { text: "keep reading", language: "en-us", intent: "reader_play", entities: [] },
      { text: "continue reading", language: "en-us", intent: "reader_play", entities: [] },
      { text: "putar", language: "id", intent: "reader_play", entities: [] },
      { text: "mulai", language: "id", intent: "reader_play", entities: [] },
      { text: "lanjutkan", language: "id", intent: "reader_play", entities: [] },
      { text: "bacakan", language: "id", intent: "reader_play", entities: [] },
      { text: "lanjut baca", language: "id", intent: "reader_play", entities: [] },
      { text: "mulai baca", language: "id", intent: "reader_play", entities: [] },
      { text: "teruskan", language: "id", intent: "reader_play", entities: [] },

      { text: "pause", language: "en-us", intent: "reader_pause", entities: [] },
      { text: "stop", language: "en-us", intent: "reader_pause", entities: [] },
      { text: "stop reading", language: "en-us", intent: "reader_pause", entities: [] },
      { text: "wait", language: "en-us", intent: "reader_pause", entities: [] },
      { text: "hold on", language: "en-us", intent: "reader_pause", entities: [] },
      { text: "be quiet", language: "en-us", intent: "reader_pause", entities: [] },
      { text: "jeda", language: "id", intent: "reader_pause", entities: [] },
      { text: "berhenti", language: "id", intent: "reader_pause", entities: [] },
      { text: "hentikan", language: "id", intent: "reader_pause", entities: [] },
      { text: "berhenti dulu", language: "id", intent: "reader_pause", entities: [] },
      { text: "diam dulu", language: "id", intent: "reader_pause", entities: [] },
      { text: "tunggu", language: "id", intent: "reader_pause", entities: [] },

      { text: "next page", language: "en-us", intent: "reader_next", entities: [] },
      { text: "next", language: "en-us", intent: "reader_next", entities: [] },
      { text: "go to next", language: "en-us", intent: "reader_next", entities: [] },
      { text: "skip ahead", language: "en-us", intent: "reader_next", entities: [] },
      { text: "forward", language: "en-us", intent: "reader_next", entities: [] },
      { text: "turn the page", language: "en-us", intent: "reader_next", entities: [] },
      { text: "halaman selanjutnya", language: "id", intent: "reader_next", entities: [] },
      { text: "lanjut", language: "id", intent: "reader_next", entities: [] },
      { text: "halaman berikutnya", language: "id", intent: "reader_next", entities: [] },
      { text: "maju", language: "id", intent: "reader_next", entities: [] },
      { text: "halaman lanjut", language: "id", intent: "reader_next", entities: [] },

      { text: "previous page", language: "en-us", intent: "reader_prev", entities: [] },
      { text: "go back one page", language: "en-us", intent: "reader_prev", entities: [] },
      { text: "prev", language: "en-us", intent: "reader_prev", entities: [] },
      { text: "last page", language: "en-us", intent: "reader_prev", entities: [] },
      { text: "page before", language: "en-us", intent: "reader_prev", entities: [] },
      { text: "halaman sebelumnya", language: "id", intent: "reader_prev", entities: [] },
      { text: "sebelumnya", language: "id", intent: "reader_prev", entities: [] },
      { text: "halaman sebelum", language: "id", intent: "reader_prev", entities: [] },
      { text: "balik satu halaman", language: "id", intent: "reader_prev", entities: [] },

      { text: "search Harry Potter", language: "en-us", intent: "search_book", entities: [{ category: "search_query", offset: 7, length: 12 }] },
      { text: "find the silent patient", language: "en-us", intent: "search_book", entities: [{ category: "search_query", offset: 5, length: 18 }] },
      { text: "search for adventure books", language: "en-us", intent: "search_book", entities: [{ category: "search_query", offset: 11, length: 15 }] },
      { text: "look for science fiction", language: "en-us", intent: "search_book", entities: [{ category: "search_query", offset: 9, length: 15 }] },
      { text: "search Laskar Pelangi", language: "en-us", intent: "search_book", entities: [{ category: "search_query", offset: 7, length: 14 }] },
      { text: "cari buku Laskar Pelangi", language: "id", intent: "search_book", entities: [{ category: "search_query", offset: 10, length: 14 }] },
      { text: "cari Penance", language: "id", intent: "search_book", entities: [{ category: "search_query", offset: 5, length: 7 }] },
      { text: "carikan buku tentang sejarah", language: "id", intent: "search_book", entities: [{ category: "search_query", offset: 21, length: 7 }] },
      { text: "ada buku apa tentang sains", language: "id", intent: "search_book", entities: [{ category: "search_query", offset: 21, length: 5 }] },

      { text: "read The Silent Patient", language: "en-us", intent: "open_book", entities: [{ category: "book_title", offset: 5, length: 18 }] },
      { text: "open Penance", language: "en-us", intent: "open_book", entities: [{ category: "book_title", offset: 5, length: 7 }] },
      { text: "read the first book", language: "en-us", intent: "open_book", entities: [{ category: "book_title", offset: 9, length: 10 }] },
      { text: "I want to read Confessions", language: "en-us", intent: "open_book", entities: [{ category: "book_title", offset: 15, length: 11 }] },
      { text: "open Laskar Pelangi", language: "en-us", intent: "open_book", entities: [{ category: "book_title", offset: 5, length: 14 }] },
      { text: "baca Laskar Pelangi", language: "id", intent: "open_book", entities: [{ category: "book_title", offset: 5, length: 14 }] },
      { text: "buka buku Penance", language: "id", intent: "open_book", entities: [{ category: "book_title", offset: 10, length: 7 }] },
      { text: "mau baca Bumi Manusia", language: "id", intent: "open_book", entities: [{ category: "book_title", offset: 9, length: 12 }] },
      { text: "bacakan Negeri 5 Menara", language: "id", intent: "open_book", entities: [{ category: "book_title", offset: 8, length: 15 }] },
      { text: "buka Confessions", language: "id", intent: "open_book", entities: [{ category: "book_title", offset: 5, length: 11 }] },

      { text: "speed 1", language: "en-us", intent: "speed_change", entities: [{ category: "speed_value", offset: 6, length: 1 }] },
      { text: "set speed to 2", language: "en-us", intent: "speed_change", entities: [{ category: "speed_value", offset: 13, length: 1 }] },
      { text: "go faster", language: "en-us", intent: "speed_change", entities: [] },
      { text: "slow down", language: "en-us", intent: "speed_change", entities: [] },
      { text: "read slower", language: "en-us", intent: "speed_change", entities: [] },
      { text: "read faster", language: "en-us", intent: "speed_change", entities: [] },
      { text: "speed up", language: "en-us", intent: "speed_change", entities: [] },
      { text: "kecepatan 1", language: "id", intent: "speed_change", entities: [{ category: "speed_value", offset: 10, length: 1 }] },
      { text: "ubah kecepatan ke 3", language: "id", intent: "speed_change", entities: [{ category: "speed_value", offset: 18, length: 1 }] },
      { text: "lebih cepat", language: "id", intent: "speed_change", entities: [] },
      { text: "pelankan", language: "id", intent: "speed_change", entities: [] },
      { text: "cepatin", language: "id", intent: "speed_change", entities: [] },
      { text: "lambatkan", language: "id", intent: "speed_change", entities: [] },
      { text: "agak pelan", language: "id", intent: "speed_change", entities: [] },

      { text: "what time is it", language: "en-us", intent: "None", entities: [] },
      { text: "hello", language: "en-us", intent: "None", entities: [] },
      { text: "thank you", language: "en-us", intent: "None", entities: [] },
      { text: "halo", language: "id", intent: "None", entities: [] },
      { text: "terima kasih", language: "id", intent: "None", entities: [] },
      { text: "apa kabar", language: "id", intent: "None", entities: [] },
    ],
  },
};

async function pollOperation(url: string, intervalMs: number, label: string): Promise<boolean> {
  let status = "running";
  let elapsed = 0;
  while (status === "running" || status === "notStarted") {
    await new Promise(r => setTimeout(r, intervalMs));
    elapsed += intervalMs / 1000;
    const res = await fetch(url, { headers: { "Ocp-Apim-Subscription-Key": KEY } });
    const data = await res.json() as any;
    status = data.status;
    console.log(`${label} status: ${status} (${elapsed}s elapsed)`);
  }
  return status === "succeeded";
}

async function run() {
  console.log("=== Literaku CLU Setup ===\n");

  console.log("Step 1: Importing CLU project...");
  const importUrl = `${ENDPOINT}/language/authoring/analyze-conversations/projects/${PROJECT_NAME}/:import?api-version=${API_VERSION}`;

  const importRes = await fetch(importUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(projectData),
  });

  if (!importRes.ok) {
    const err = await importRes.text();
    console.error(`Import failed: ${importRes.status}`, err);
    return;
  }

  const importOp = importRes.headers.get("operation-location");
  if (!importOp) { console.error("No operation-location header"); return; }
  console.log("Import started...");

  if (!(await pollOperation(importOp, 3000, "Import"))) {
    console.error("Import failed!");
    return;
  }
  console.log("Project imported successfully!\n");

  console.log("Step 2: Training model...");
  const trainUrl = `${ENDPOINT}/language/authoring/analyze-conversations/projects/${PROJECT_NAME}/:train?api-version=${API_VERSION}`;

  const trainRes = await fetch(trainUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      modelLabel: "v1",
      trainingMode: "standard",
      evaluationOptions: { kind: "percentage", testingSplitPercentage: 20, trainingSplitPercentage: 80 },
    }),
  });

  if (!trainRes.ok) {
    const err = await trainRes.text();
    console.error(`Train failed: ${trainRes.status}`, err);
    return;
  }

  const trainOp = trainRes.headers.get("operation-location");
  if (!trainOp) { console.error("No operation-location header"); return; }
  console.log("Training started (this may take 2-5 minutes)...");

  if (!(await pollOperation(trainOp, 10000, "Training"))) {
    console.error("Training failed!");
    return;
  }
  console.log("Model trained successfully!\n");

  console.log("Step 3: Deploying model...");
  const deployUrl = `${ENDPOINT}/language/authoring/analyze-conversations/projects/${PROJECT_NAME}/deployments/${DEPLOYMENT_NAME}?api-version=${API_VERSION}`;

  const deployRes = await fetch(deployUrl, {
    method: "PUT",
    headers,
    body: JSON.stringify({ trainedModelLabel: "v1" }),
  });

  if (!deployRes.ok) {
    const err = await deployRes.text();
    console.error(`Deploy failed: ${deployRes.status}`, err);
    return;
  }

  const deployOp = deployRes.headers.get("operation-location");
  if (!deployOp) { console.error("No operation-location header"); return; }
  console.log("Deployment started...");

  if (!(await pollOperation(deployOp, 5000, "Deploy"))) {
    console.error("Deployment failed!");
    return;
  }
  console.log("Model deployed successfully!\n");

  console.log("Step 4: Testing model...");
  const testUrl = `${ENDPOINT}/language/:analyze-conversations?api-version=2022-10-01-preview`;
  const testCases = [
    { text: "buka koleksi", lang: "id" },
    { text: "lanjut baca", lang: "id" },
    { text: "cepatin", lang: "id" },
    { text: "mau ke beranda", lang: "id" },
    { text: "cari buku sains", lang: "id" },
    { text: "open my books", lang: "en" },
    { text: "read to me", lang: "en" },
    { text: "go faster", lang: "en" },
    { text: "search Harry Potter", lang: "en" },
    { text: "take me home", lang: "en" },
  ];

  for (const { text, lang } of testCases) {
    const testRes = await fetch(testUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        kind: "Conversation",
        analysisInput: {
          conversationItem: { id: "1", text, participantId: "user", language: lang },
        },
        parameters: {
          projectName: PROJECT_NAME,
          deploymentName: DEPLOYMENT_NAME,
          stringIndexType: "TextElement_V8",
        },
      }),
    });

    const testData = await testRes.json() as any;
    const prediction = testData.result?.prediction;
    if (prediction) {
      const topIntent = prediction.topIntent;
      const confidence = prediction.intents?.find((i: any) => i.category === topIntent)?.confidenceScore;
      const entities = prediction.entities?.map((e: any) => `${e.category}="${e.text}"`).join(", ") || "none";
      console.log(`  "${text}" → ${topIntent} (${(confidence * 100).toFixed(0)}%) [entities: ${entities}]`);
    } else {
      console.log(`  "${text}" → ERROR:`, JSON.stringify(testData).slice(0, 200));
    }
  }

  console.log("\n=== CLU Setup Complete! ===");
  console.log(`Project: ${PROJECT_NAME}`);
  console.log(`Deployment: ${DEPLOYMENT_NAME}`);
  console.log(`Intents: 16 (15 + None)`);
  console.log(`Utterances: ${projectData.assets.utterances.length}`);
  console.log(`Languages: EN + ID bilingual`);
}

run().catch(console.error);

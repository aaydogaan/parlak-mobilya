import http from "http";

const urlsToTest = [
  "/",
  "/hakkimizda",
  "/about",
  "/hizmetler",
  "/services",
  "/projeler",
  "/projeler/konya-mutfak-dolaplari",
  "/projeler/modern-gardirop-modelleri",
  "/projeler/ozel-olcu-vestiyer-modelleri",
  "/projeler/komple-ev-yenileme",
  "/projeler/konya-tv-unitesi",
  "/projeler/konya-cocuk-odasi",
  "/galeri",
  "/blog",
  "/blog/yeni-web-sitemiz-yayinda",
  "/blog/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
  "/yeni-web-sitemiz-yayinda",
  "/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
  "/iletisim",
  "/contact",
  "/kvkk",
  "/gizlilik-politikasi",
  "/cerez-politikasi",
  "/reviews",
  "/urunler",
  // Image CDN redirect test
  "/wp-content/uploads/2026/07/konya-parlak-mobilya-dekorasyon-gardrop-45-scaled.webp",
];

function checkUrl(path) {
  return new Promise((resolve) => {
    const req = http.get(
      {
        hostname: "127.0.0.1",
        port: 8080,
        path: path,
        headers: {
          "Accept": "text/html,application/xhtml+xml,image/*",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
        });
        res.on("end", () => {
          resolve({
            path,
            status: res.statusCode,
            location: res.headers.location || null,
            contentLength: body.length,
            titleMatch: body.match(/<title>([^<]+)<\/title>/)?.[1] || null,
          });
        });
      }
    );

    req.on("error", (err) => {
      resolve({ path, status: "ERROR: " + err.message });
    });
  });
}

async function run() {
  console.log("Checking all URLs against dev server http://127.0.0.1:8080...\n");
  const results = [];
  let hasFailure = false;

  for (const path of urlsToTest) {
    const res = await checkUrl(path);
    results.push(res);
    const ok = res.status === 200 || (res.status === 301 && res.location?.includes("cdn.parlakmobilyadekorasyon.com"));
    if (!ok) hasFailure = true;
    console.log(
      `${ok ? "✅ PASS" : "❌ FAIL"} [${res.status}] ${path} ${
        res.location ? `-> ${res.location}` : res.titleMatch ? `(${res.titleMatch})` : ""
      }`
    );
  }

  console.log("\nSummary:");
  console.log(`Total URLs Tested: ${results.length}`);
  console.log(`Status: ${hasFailure ? "FAILURES DETECTED" : "ALL 100% SUCCESS"}`);
}

run();

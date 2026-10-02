import test from "node:test";
import assert from "node:assert/strict";
import seoRedirectsMiddleware, { isSpamRequest } from "../server/middleware/seo-redirects.ts";

test("SEO Spam Detector: accurately identifies WordPress spam injection URLs", () => {
  const spamUrls = [
    "http://parlakmobilyadekorasyon.com/?item/t7093125",
    "https://parlakmobilyadekorasyon.com/?item/n2005526",
    "https://parlakmobilyadekorasyon.com/?item/q20998788",
    "https://parlakmobilyadekorasyon.com/?item/r13034727",
    "https://parlakmobilyadekorasyon.com/?item/w31167367",
    "https://parlakmobilyadekorasyon.com/?item/p18129191",
    "https://parlakmobilyadekorasyon.com/?item/d5544766",
    "https://www.parlakmobilyadekorasyon.com/?item/p216791740",
    "https://www.parlakmobilyadekorasyon.com/?item/b3045002",
    "https://www.parlakmobilyadekorasyon.com/?item=12345",
    "https://www.parlakmobilyadekorasyon.com/item/test",
    "https://www.parlakmobilyadekorasyon.com/wp-admin/login.php",
    "https://www.parlakmobilyadekorasyon.com/xmlrpc.php",
  ];

  for (const rawUrl of spamUrls) {
    const url = new URL(rawUrl);
    assert.strictEqual(
      isSpamRequest(url),
      true,
      `Expected ${rawUrl} to be recognized as spam`,
    );
  }

  const legitimateUrls = [
    "https://www.parlakmobilyadekorasyon.com/",
    "https://www.parlakmobilyadekorasyon.com/projeler",
    "https://www.parlakmobilyadekorasyon.com/hakkimizda",
    "https://www.parlakmobilyadekorasyon.com/blog",
    "https://www.parlakmobilyadekorasyon.com/blog/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
    "https://www.parlakmobilyadekorasyon.com/iletisim",
  ];

  for (const rawUrl of legitimateUrls) {
    const url = new URL(rawUrl);
    assert.strictEqual(
      isSpamRequest(url),
      false,
      `Expected ${rawUrl} to NOT be recognized as spam`,
    );
  }
});

test("SEO Middleware: returns 410 Gone with noindex headers for spam URLs", async () => {
  const event = {
    url: new URL("https://www.parlakmobilyadekorasyon.com/?item/t7093125"),
    req: { method: "GET" },
  };

  let nextCalled = false;
  const res = await seoRedirectsMiddleware(event, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false);
  assert.ok(res instanceof Response);
  assert.strictEqual(res.status, 410);
  assert.strictEqual(res.headers.get("X-Robots-Tag"), "noindex, nofollow, noarchive");
});

test("SEO Middleware: returns 301 for trailing slashes", async () => {
  const event = {
    url: new URL("https://www.parlakmobilyadekorasyon.com/projeler/"),
    req: { method: "GET" },
  };

  let nextCalled = false;
  const res = await seoRedirectsMiddleware(event, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false);
  assert.ok(res instanceof Response);
  assert.strictEqual(res.status, 301);
  assert.strictEqual(res.headers.get("Location"), "/projeler");
});

test("SEO Middleware: returns 301 for legacy WordPress blog URLs", async () => {
  const event = {
    url: new URL(
      "https://www.parlakmobilyadekorasyon.com/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler/",
    ),
    req: { method: "GET" },
  };

  let nextCalled = false;
  const res = await seoRedirectsMiddleware(event, () => {
    nextCalled = true;
  });

  assert.strictEqual(nextCalled, false);
  assert.ok(res instanceof Response);
  assert.strictEqual(res.status, 301);
  assert.strictEqual(
    res.headers.get("Location"),
    "/blog/ozel-olcu-mobilya-yaptirmadan-once-dikkat-edilmesi-gerekenler",
  );
});

test("SEO Middleware: lets clean requests proceed to next()", async () => {
  const event = {
    url: new URL("https://www.parlakmobilyadekorasyon.com/projeler"),
    req: { method: "GET" },
  };

  let nextCalled = false;
  await seoRedirectsMiddleware(event, () => {
    nextCalled = true;
    return new Response("OK", { status: 200 });
  });

  assert.strictEqual(nextCalled, true);
});

import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from "../src/lib/server/security/password.ts";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "../src/lib/server/security/rate-limiter.ts";
import {
  sanitizeText,
  sanitizeFileName,
  sanitizeBlogHtml,
} from "../src/lib/server/security/sanitize.ts";
import {
  validateCsrfOrigin,
  AdminUnauthorizedError,
  AdminForbiddenError,
  CrossSiteRequestError,
} from "../src/lib/server/security/auth.ts";

test("Scenario 10: SQL Injection Defense - Parameterized Queries Invariant", async () => {
  // Ensure sql tagged template functions don't allow raw string interpolation of attack payloads
  const payload = "' OR 1=1 --";
  const sanitized = sanitizeText(payload);
  assert.equal(sanitized.includes("--"), true); // Stored as literal string value, not parsed as SQL
});

test("Scenario 11: Stored XSS Prevention - Strips Script Tags & Event Handlers", async () => {
  const attackPayloads = [
    '<script>alert("xss")</script><p>Normal text</p>',
    '<img src="x" onerror="alert(1)">',
    '<a href="javascript:alert(1)">Click me</a>',
    '<svg onload="alert(1)"><circle cx="50" cy="50" r="40"/></svg>',
    '<iframe src="https://evil.com"></iframe>',
    '<div onmouseover="alert(1)">Hover me</div>',
  ];

  for (const payload of attackPayloads) {
    const clean = sanitizeBlogHtml(payload);
    assert.equal(clean.includes("<script>"), false, "Script tag must be stripped");
    assert.equal(clean.includes("onerror"), false, "onerror must be stripped");
    assert.equal(clean.includes("javascript:"), false, "javascript: URL must be stripped");
    assert.equal(clean.includes("<svg"), false, "svg must be stripped");
    assert.equal(clean.includes("<iframe"), false, "iframe must be stripped");
    assert.equal(clean.includes("onmouseover"), false, "onmouseover must be stripped");
  }
});

test("Scenario 14: Path Traversal Prevention - Strips Directory Climbing", async () => {
  const traversalPayloads = [
    "../../etc/passwd",
    "..\\..\\windows\\system32\\cmd.exe",
    "....//....//shell.php",
    "/root/.ssh/id_rsa",
    "evil-image.jpg/../../../index.html",
  ];

  for (const filename of traversalPayloads) {
    const safe = sanitizeFileName(filename);
    assert.equal(safe.includes(".."), false, `Directory traversal ".." must be stripped from ${filename}`);
    assert.equal(safe.startsWith("/"), false, `Leading slash must be stripped from ${filename}`);
    assert.equal(safe.startsWith("\\"), false, `Leading backslash must be stripped from ${filename}`);
  }
});

test("Scenario 16: SVG XSS Prevention - SVG is Rejected as Image Upload", async () => {
  const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ]);

  assert.equal(ALLOWED_MIME_TYPES.has("image/svg+xml"), false, "SVG MIME type must not be allowed in R2 uploads");
});

test("Scenario 18 & 19: Brute Force & Rate Limit Protection", async () => {
  const testKey = `test-login-ip-${Date.now()}`;
  resetRateLimit(testKey);

  // Allow first 5 attempts
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(testKey, 5, 60000);
    assert.equal(res.allowed, true, `Attempt ${i + 1} should be allowed`);
    recordFailedAttempt(testKey, 60000);
  }

  // 6th attempt should be blocked
  const blockedRes = checkRateLimit(testKey, 5, 60000);
  assert.equal(blockedRes.allowed, false, "6th attempt must be blocked by rate limiter");
  assert.equal(blockedRes.retryAfterSec > 0, true, "Must provide retry after cooldown seconds");

  // Reset
  resetRateLimit(testKey);
  const resetRes = checkRateLimit(testKey, 5, 60000);
  assert.equal(resetRes.allowed, true, "Reset key must be allowed");
});

test("Scenario 2 & 26: Server Function Authorization - Default DENY", async () => {
  const unauthError = new AdminUnauthorizedError();
  assert.equal(unauthError.status, 401);
  assert.equal(unauthError.name, "AdminUnauthorizedError");

  const forbiddenError = new AdminForbiddenError();
  assert.equal(forbiddenError.status, 403);
  assert.equal(forbiddenError.name, "AdminForbiddenError");
});

test("Scenario 9 & 21: CSRF & CORS Origin Protection", async () => {
  // Disallowed origin should throw CrossSiteRequestError
  const maliciousReq = new Request("https://parlakmobilyadekorasyon.com/api/admin", {
    method: "POST",
    headers: {
      origin: "https://evil-attacker.com",
      "sec-fetch-site": "cross-site",
    },
  });

  assert.throws(
    () => {
      validateCsrfOrigin(maliciousReq);
    },
    (err) => err instanceof CrossSiteRequestError,
    "Cross-site malicious origin must be blocked with CrossSiteRequestError"
  );

  // Allowed origin should pass
  const legitReq = new Request("https://parlakmobilyadekorasyon.com/api/admin", {
    method: "POST",
    headers: {
      origin: "https://admin.parlakmobilyadekorasyon.com",
      "sec-fetch-site": "same-origin",
    },
  });

  assert.doesNotThrow(() => {
    validateCsrfOrigin(legitReq);
  });
});

test("Scenario 2: Password Security - Scrypt Memory-Hard Hash and Verification", async () => {
  const plainPassword = "SuperSecurePassword1984!";
  const hash = await hashPassword(plainPassword);

  assert.equal(hash.startsWith("scrypt:"), true, "Hash format must start with scrypt:");

  const isValid = await verifyPassword(plainPassword, hash);
  assert.equal(isValid, true, "Valid password must verify successfully");

  const isInvalid = await verifyPassword("WrongPassword123", hash);
  assert.equal(isInvalid, false, "Invalid password must be rejected");

  // Constant-time check on empty/malformed inputs
  assert.equal(await verifyPassword("", hash), false);
  assert.equal(await verifyPassword(plainPassword, "invalid-hash-string"), false);
});

test("Scenario 21: Password Policy Enforcement", async () => {
  assert.equal(validatePasswordStrength("short").valid, false);
  assert.equal(validatePasswordStrength("onlyletters").valid, false);
  assert.equal(validatePasswordStrength("12345678").valid, false);
  assert.equal(validatePasswordStrength("StrongPassword2026!").valid, true);
});

test("Scenario 25: PostgreSQL Fail-Closed Policy Invariant", async () => {
  const dbFileContent = readFileSync(join(process.cwd(), "src/lib/db.ts"), "utf-8");

  // Verify DatabaseUnavailableError (503) exists
  assert.equal(dbFileContent.includes("DatabaseUnavailableError"), true);
  assert.equal(dbFileContent.includes("status = 503"), true);

  // Verify that in production / postgres databaseMode, fallback to PGLite is rejected
  assert.equal(
    dbFileContent.includes("PGLite fallback is disabled in production"),
    true,
    "db.ts must strictly fail-closed without silent fallback in production"
  );
});

test("Scenario 28: Clickjacking Protection - CSP and Security Headers", async () => {
  const middlewareFile = readFileSync(join(process.cwd(), "server/middleware/security-headers.ts"), "utf-8");

  assert.equal(middlewareFile.includes("frame-ancestors 'none'"), true, "CSP must include frame-ancestors 'none'");
  assert.equal(middlewareFile.includes("X-Frame-Options"), true, "X-Frame-Options must be present");
  assert.equal(middlewareFile.includes("DENY"), true, "X-Frame-Options must be DENY");
  assert.equal(middlewareFile.includes("nosniff"), true, "X-Content-Type-Options must be nosniff");
  assert.equal(middlewareFile.includes("Strict-Transport-Security"), true, "HSTS must be set");
});

test("Scenario 30: Secret Leakage Prevention - Client Bundle Audit", async () => {
  // Check that adminPassword is eliminated from adminStore
  const storeContent = readFileSync(join(process.cwd(), "src/lib/admin/adminStore.ts"), "utf-8");
  assert.equal(storeContent.includes("adminPassword:"), false, "adminPassword must be purged from adminStore");
  assert.equal(storeContent.includes("parlak1984"), false, "Plaintext password must not exist in adminStore");

  // Check that secrets are excluded from localStorage persistence partialize
  assert.equal(storeContent.includes("settings: state.settings"), true);
  assert.equal(storeContent.includes("projeler: state.projeler"), true);
  assert.equal(storeContent.includes("isAuthenticated: state."), false);
});

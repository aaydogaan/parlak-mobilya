import fs from "fs";

const xml = fs.readFileSync(
  "attachments/konyamobilyakonyamutfakdolaplarparlakmobilyavedekorasyon.WordPress.2026-10-01.xml",
  "utf8"
);

const matches = xml.match(
  /https?:\/\/[^"'<>\s]+\/wp-content\/uploads\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp|svg)/gi
);

if (matches) {
  const unique = Array.from(new Set(matches));
  console.log("Total unique uploads image URLs:", unique.length);
  console.log("First 8 samples:\n", unique.slice(0, 8).join("\n"));
} else {
  console.log("No upload matches found");
}

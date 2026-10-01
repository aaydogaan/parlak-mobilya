import fs from "fs";

const data = JSON.parse(fs.readFileSync("src/data/pages_extracted.json", "utf8"));
const content = data["galeri"]?.content || "";
const imgs = [
  ...content.matchAll(
    /https?:\/\/[^"'<>\s]+\/wp-content\/uploads\/[^"'<>\s]+\.(?:jpg|jpeg|png|webp)/gi
  ),
].map((m) => m[0]);

const unique = Array.from(new Set(imgs))
  .filter((img) => !img.includes("-150x") && !img.includes("-300x") && !img.includes("-225x"))
  .map((img) => img.replace(/^https?:\/\/[^/]+/, ""));

console.log("Galeri high-res image count:", unique.length);

fs.writeFileSync(
  "src/data/galeri_images.json",
  JSON.stringify(unique, null, 2)
);

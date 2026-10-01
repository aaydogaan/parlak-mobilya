import fs from "fs";

const xml = fs.readFileSync(
  "attachments/konyamobilyakonyamutfakdolaplarparlakmobilyavedekorasyon.WordPress.2026-10-01.xml",
  "utf8"
);

console.log("=== 1. SEARCHING FOR FAVICON / SITE ICON ===");
const iconIdMatch = xml.match(/site_icon[^0-9]*([0-9]+)/);
console.log("Site icon ID match:", iconIdMatch ? iconIdMatch[1] : "None");

// Look for attachments with icon, favicon, cropped in filename or title
const items = xml.split("<item>").slice(1);
for (const item of items) {
  const postType = item.match(/<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/) || item.match(/<wp:post_type>(.*?)<\/wp:post_type>/);
  const attachmentUrl = item.match(/<wp:attachment_url><!\[CDATA\[(.*?)\]\]><\/wp:attachment_url>/) || item.match(/<wp:attachment_url>(.*?)<\/wp:attachment_url>/);
  const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
  const url = attachmentUrl ? attachmentUrl[1] : "";
  if (url.includes("favicon") || url.includes("icon") || url.includes("cropped-") || url.includes("logo")) {
    console.log("Icon/Logo Attachment:", { title: title ? title[1] : "", url });
  }
}

console.log("\n=== 2. SEARCHING FOR VIDEOS ===");
const videoRegex = /https?:\/\/[^"'<>\s]+\.(?:mp4|webm|mov|m4v)|https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[^"'<>\s&]+|youtu\.be\/[^"'<>\s]+|vimeo\.com\/[^"'<>\s]+)/gi;
const videos = [...xml.matchAll(videoRegex)].map((m) => m[0]);
console.log("Videos found in XML:", Array.from(new Set(videos)));

console.log("\n=== 3. SEARCHING FOR WP MENU ===");
const menuItems = [];
for (const item of items) {
  if (item.includes("nav_menu_item")) {
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || item.match(/<title>(.*?)<\/title>/);
    const urlMatch = item.match(/_menu_item_url[\s\S]*?<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/);
    const objectMatch = item.match(/_menu_item_object[\s\S]*?<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/);
    const objectIdMatch = item.match(/_menu_item_object_id[\s\S]*?<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/);
    const parentIdMatch = item.match(/_menu_item_menu_item_parent[\s\S]*?<wp:meta_value><!\[CDATA\[(.*?)\]\]><\/wp:meta_value>/);
    const postName = item.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/);

    menuItems.push({
      id: postName ? postName[1] : "",
      title: titleMatch ? titleMatch[1] : "",
      url: urlMatch ? urlMatch[1] : "",
      object: objectMatch ? objectMatch[1] : "",
      objectId: objectIdMatch ? objectIdMatch[1] : "",
      parent: parentIdMatch ? parentIdMatch[1] : "0"
    });
  }
}
console.log("Menu items count:", menuItems.length);
console.log("Menu items detail:", JSON.stringify(menuItems, null, 2));

console.log("\n=== 4. HAKKIMIZDA CONTENT SNIPPET ===");
for (const item of items) {
  const postName = item.match(/<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/);
  if (postName && postName[1] === "hakkimizda") {
    const content = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
    if (content) {
      console.log("Hakkimizda content length:", content[1].length);
      fs.writeFileSync("src/data/hakkimizda_raw.html", content[1], "utf8");
      console.log("Saved hakkimizda raw content to src/data/hakkimizda_raw.html");
    }
  }
}

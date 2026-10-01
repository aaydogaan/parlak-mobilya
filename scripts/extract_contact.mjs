import fs from "fs";

const xml = fs.readFileSync(
  "attachments/konyamobilyakonyamutfakdolaplarparlakmobilyavedekorasyon.WordPress.2026-10-01.xml",
  "utf8"
);

// Find phone numbers, emails, addresses in XML
const phones = Array.from(xml.matchAll(/(?:\+90|0)?\s*[0-9]{3}\s*[0-9]{3}\s*[0-9]{2}\s*[0-9]{2}/g)).map(m=>m[0]);
const emails = Array.from(xml.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g)).map(m=>m[0]);
console.log('Unique phones:', Array.from(new Set(phones)));
console.log('Unique emails:', Array.from(new Set(emails)));

// Look for contact page content
const contactItem = xml.match(/<title><!\[CDATA\[İletişim\]\]><\/title>[\s\S]*?<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
if (contactItem) {
  console.log('\nContact page raw text snippet:');
  console.log(contactItem[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 500));
}

// Look for about page content
const aboutItem = xml.match(/<title><!\[CDATA\[Hakkımızda\]\]><\/title>[\s\S]*?<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
if (aboutItem) {
  console.log('\nAbout page raw text snippet:');
  console.log(aboutItem[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 500));
}

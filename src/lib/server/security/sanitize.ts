/**
 * Enterprise HTML & Input Sanitizer for Blog Content and User Inputs.
 * Strictly prevents Stored XSS, DOM Injection, and Path Traversal.
 */

const ALLOWED_TAGS = new Set([
  "p", "h1", "h2", "h3", "h4", "h5", "h6",
  "strong", "b", "em", "i", "u", "s", "strike", "blockquote",
  "ul", "ol", "li", "a", "img", "table", "thead", "tbody", "tr", "th", "td",
  "div", "span", "br", "hr", "code", "pre"
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "title", "class"]),
  img: new Set(["src", "alt", "title", "class", "data-size", "data-align", "width", "height"]),
  table: new Set(["class"]),
  th: new Set(["class", "colspan", "rowspan", "style"]),
  td: new Set(["class", "colspan", "rowspan", "style"]),
  div: new Set(["class", "style"]),
  span: new Set(["class", "style"]),
  p: new Set(["class", "style"]),
  h2: new Set(["class", "style"]),
  h3: new Set(["class", "style"]),
  h4: new Set(["class", "style"]),
  h5: new Set(["class", "style"]),
};

const DANGEROUS_PROTOCOLS = /^(javascript|vbscript|data):/i;

/**
 * Sanitizes rich text HTML content for blog articles, stripping any malicious scripts,
 * event handlers, iframes, and dangerous protocol URLs.
 */
export function sanitizeBlogHtml(dirtyHtml: string): string {
  if (!dirtyHtml || typeof dirtyHtml !== "string") return "";

  // 1. Remove script, style, iframe, object, embed, form, svg tags and their contents
  let clean = dirtyHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "");

  // 2. Parse tags and strip disallowed tags and attributes
  clean = clean.replace(/<\/?([a-z0-9-]+)([^>]*)>/gi, (match, tagName: string, rawAttrs: string) => {
    const tag = tagName.toLowerCase();
    const isClosing = match.startsWith("</");

    if (!ALLOWED_TAGS.has(tag)) {
      return ""; // Strip disallowed tag entirely
    }

    if (isClosing) {
      return `</${tag}>`;
    }

    // Process attributes
    const allowedTagAttrs = ALLOWED_ATTRS[tag] || new Set(["class"]);
    const cleanedAttrs: string[] = [];

    // Extract attributes using regex
    const attrRegex = /([a-z0-9_-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/gi;
    let attrMatch: RegExpExecArray | null;

    while ((attrMatch = attrRegex.exec(rawAttrs)) !== null) {
      const attrName = attrMatch[1].toLowerCase();
      const attrValue = attrMatch[2] ?? attrMatch[3] ?? attrMatch[4] ?? "";

      // Strip any event handlers (onclick, onerror, onload, etc.)
      if (attrName.startsWith("on")) {
        continue;
      }

      // Check protocol on href / src
      if (attrName === "href" || attrName === "src") {
        const trimmedVal = attrValue.trim();
        if (DANGEROUS_PROTOCOLS.test(trimmedVal)) {
          continue;
        }
      }

      if (allowedTagAttrs.has(attrName)) {
        // Enforce safe link rel
        if (tag === "a" && attrName === "target" && attrValue === "_blank") {
          cleanedAttrs.push('target="_blank" rel="noopener noreferrer"');
        } else if (tag === "a" && attrName === "rel") {
          // Handled alongside target
        } else {
          // Escape quotes in attribute value
          const safeVal = attrValue.replace(/"/g, "&quot;");
          cleanedAttrs.push(`${attrName}="${safeVal}"`);
        }
      }
    }

    return `<${tag}${cleanedAttrs.length > 0 ? " " + cleanedAttrs.join(" ") : ""}>`;
  });

  return clean;
}

/**
 * Sanitizes plain text inputs, removing HTML tags and trimming.
 */
export function sanitizeText(text: string, maxLength = 500): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Strictly sanitizes uploaded filenames, preventing path traversal and non-safe characters.
 */
export function sanitizeFileName(fileName: string): string {
  if (!fileName || typeof fileName !== "string") {
    return "file";
  }

  // Strip path traversal characters (../, ..\, /, \)
  const baseName = fileName.replace(/^.*[\\/]/, "");
  
  // Keep only safe characters: a-z, 0-9, ., _, -
  const clean = baseName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+/, "")
    .slice(0, 100);

  return clean || "upload";
}

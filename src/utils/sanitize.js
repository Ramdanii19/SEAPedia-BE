import sanitizeHtml from "sanitize-html";

// Strip semua HTML tags dan atribut — cocok untuk konten user-generated (comment, name, dll).
export function sanitizeText(raw) {
  return sanitizeHtml(String(raw ?? ""), { allowedTags: [], allowedAttributes: {} });
}

const allowedTags = /<(?!\/?(?:p|br|strong|b|em|i|u|h2|h3|ul|ol|li|blockquote|a)(?:\s|>|\/))[^>]*>/gi

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#039;")
}

export function sanitizeBlogHtml(value: string) {
  if (!/<[a-z][\s\S]*>/i.test(value)) return escapeHtml(value).replace(/\r?\n/g, "<br />")
  return value
    .replace(/<\/?(?:script|style|iframe|object|embed|form)[^>]*>/gi, "")
    .replace(/\son[a-z-]+\s*=\s*(?:\"[^\"]*\"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|src)\s*=\s*(?:\"\s*javascript:[^\"]*\"|'\s*javascript:[^']*'|[^\s>]+)/gi, "")
    .replace(allowedTags, "")
}

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

export interface Heading {
  level: "h2" | "h3"
  text: string
}

export function extractHeadings(html: string): Heading[] {
  const headingRegex = /<h([23])[^>]*>([^<]+)<\/h\1>/gi
  const headings: Heading[] = []
  let match

  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: `h${match[1]}` as "h2" | "h3",
      text: match[2].replace(/<[^>]*>/g, "").trim(),
    })
  }

  return headings
}

export function calculateReadingTime(html: string): number {
  // Remove HTML tags and count words
  const text = html.replace(/<[^>]*>/g, "").trim()
  const words = text.split(/\s+/).length
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

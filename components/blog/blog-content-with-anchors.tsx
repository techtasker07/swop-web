"use client"

export function BlogContentWithAnchors({ content }: { content: string }) {
  // Add IDs to headings for smooth scroll navigation
  const contentWithAnchors = content.replace(
    /<h([23])[^>]*>([^<]+)<\/h\1>/gi,
    (match, level, text, offset, string) => {
      const headingIndex = (string.substring(0, offset).match(/<h[23]/g) || []).length
      return `<h${level} id="heading-${headingIndex}">
        <a href="#heading-${headingIndex}" class="no-underline hover:text-primary transition-colors">${text}</a>
      </h${level}>`
    }
  )

  return (
    <div dangerouslySetInnerHTML={{ __html: contentWithAnchors }} />
  )
}

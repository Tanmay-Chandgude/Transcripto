type SEOMetadata = {
  title: string
  description: string
  keywords: string[]
  language: string
}

export function generateSEOMetadata(content: string, language: string = 'en'): SEOMetadata {
  // Extract keywords from content (simplified example)
  const keywords = content
    .split(' ')
    .filter(word => word.length > 5)
    .slice(0, 10)

  // Generate description (first 160 characters)
  const description = content.slice(0, 160) + '...'

  return {
    title: '', // To be filled by the component
    description,
    keywords,
    language
  }
}

export function generateStructuredData(blog: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: blog.title,
    datePublished: blog.created_at,
    dateModified: blog.updated_at,
    author: {
      '@type': 'Person',
      name: blog.author_name || 'Anonymous'
    },
    description: blog.description || '',
    inLanguage: blog.original_language,
    availableLanguages: blog.translations?.map((t: any) => t.language) || []
  }
} 
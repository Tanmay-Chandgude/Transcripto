import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import MaxWidthWrapper from '@/components/MaxWidthWrapper'
import { notFound } from 'next/navigation'
import { generateSEOMetadata, generateStructuredData } from '@/lib/seo'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', params.slug)
    .single()

  if (!blog) return { title: 'Blog Not Found' }

  const seoMetadata = generateSEOMetadata(blog.content, blog.original_language)

  return {
    title: blog.title,
    description: seoMetadata.description,
    keywords: seoMetadata.keywords,
    openGraph: {
      title: blog.title,
      description: seoMetadata.description,
      type: 'article',
      publishedTime: blog.created_at,
      modifiedTime: blog.updated_at,
      authors: [blog.author_name || 'Anonymous'],
    },
  }
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const { data: blog } = await supabase
    .from('blogs')
    .select(`
      *,
      translations (
        language,
        translated_title,
        translated_content
      )
    `)
    .eq('id', params.slug)
    .single()

  if (!blog) notFound()

  const structuredData = generateStructuredData(blog)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MaxWidthWrapper className="mb-8 mt-24">
        <article className="prose lg:prose-xl mx-auto">
          <h1>{blog.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />

          {blog.translations?.length > 0 && (
            <div className="mt-8">
              <h2>Available Translations</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {blog.translations.map((translation: any) => (
                  <div
                    key={translation.language}
                    className="rounded-lg border p-4"
                  >
                    <h3>{translation.translated_title}</h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: translation.translated_content,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </MaxWidthWrapper>
    </>
  )
} 
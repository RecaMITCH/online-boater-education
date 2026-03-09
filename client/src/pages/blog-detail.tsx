import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo";
import { ArrowLeft, Clock, ChevronRight, ArrowRight } from "lucide-react";
import type { Article } from "@shared/schema";

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ["/api/articles", slug],
    enabled: !!slug,
  });

  const { data: allArticles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  // Related articles: other published articles, excluding the current one
  const relatedArticles = allArticles
    ?.filter((a) => a.slug !== slug && a.isPublished)
    ?.slice(0, 3);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Article Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This article doesn't exist or has been removed.
          </p>
          <Link href="/blog">
            <Button data-testid="button-back-to-blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://www.onlineboatereducation.com/blog/${article.slug}`;

  return (
    <div className="min-h-screen">
      <SEO
        title={article.metaTitle || article.title}
        description={article.metaDescription || article.excerpt || ""}
        canonical={canonicalUrl}
        ogImage={article.coverImageUrl || undefined}
        ogType="article"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": article.title,
            "description": article.metaDescription || article.excerpt || "",
            "url": canonicalUrl,
            "datePublished": article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
            "dateModified": article.updatedAt ? new Date(article.updatedAt).toISOString() : undefined,
            "image": article.coverImageUrl || undefined,
            "publisher": {
              "@type": "Organization",
              "name": "Online Boater Education",
              "url": "https://www.onlineboatereducation.com"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": canonicalUrl
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.onlineboatereducation.com/" },
              { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.onlineboatereducation.com/blog" },
              { "@type": "ListItem", "position": 3, "name": article.title }
            ]
          }
        ]}
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
          <ol className="flex items-center gap-1">
            <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
            <li><ChevronRight className="h-3 w-3" /></li>
            <li className="text-foreground font-medium line-clamp-1">{article.title}</li>
          </ol>
        </nav>

        {article.coverImageUrl && (
          <div className="relative mb-8 rounded-md overflow-hidden">
            <img
              src={article.coverImageUrl}
              alt={article.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        )}

        <h1 className="font-serif text-3xl font-bold sm:text-4xl leading-tight mb-4" data-testid="text-article-title">
          {article.title}
        </h1>

        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground mb-8 pb-6 border-b">
          {article.publishedAt && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          )}
        </div>

        <div
          className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-serif prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: article.content }}
          data-testid="article-content"
        />
      </article>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="border-t bg-card py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="font-serif text-2xl font-bold mb-6">More Articles</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {relatedArticles.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`}>
                  <Card className="group hover-elevate cursor-pointer h-full">
                    <CardContent className="p-0 flex flex-col h-full">
                      {related.coverImageUrl ? (
                        <div className="relative h-32 overflow-hidden rounded-t-md">
                          <img
                            src={related.coverImageUrl}
                            alt={related.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-32 bg-accent rounded-t-md" />
                      )}
                      <div className="p-3 flex flex-col flex-1 gap-1">
                        <h3 className="font-semibold text-sm line-clamp-2">{related.title}</h3>
                        <span className="flex items-center gap-1 text-xs font-medium text-primary mt-auto pt-1">
                          Read More
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

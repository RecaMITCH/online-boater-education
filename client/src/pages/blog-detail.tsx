import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo";
import { ArrowLeft, Clock, User } from "lucide-react";
import type { Article } from "@shared/schema";

export default function BlogDetail() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ["/api/articles", slug],
    enabled: !!slug,
  });

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

  return (
    <div className="min-h-screen">
      <SEO
        title={`${article.metaTitle || article.title} - Online Boater Education`}
        description={article.metaDescription || article.excerpt || ""}
      />
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-14">
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="-ml-2 mb-6" data-testid="button-back-blog">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Blog
          </Button>
        </Link>

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
    </div>
  );
}

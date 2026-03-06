import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo";
import { Clock, ArrowRight } from "lucide-react";
import type { Article } from "@shared/schema";

export default function BlogList() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  return (
    <div className="min-h-screen">
      <SEO
        title="Boater Education Blog - Tips, Guides & Resources"
        description="Expert tips, guides, and resources for boater education. Stay informed about safety practices and certification requirements."
      />
      <section className="bg-card border-b py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl" data-testid="text-blog-title">
            Blog & Articles
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Guides, tips, and news about boater education, safety, and the water.
          </p>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-44 w-full rounded-t-md" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <Link key={article.id} href={`/blog/${article.slug}`}>
                  <Card className="group hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`card-blog-${article.slug}`}>
                    <CardContent className="p-0 flex flex-col h-full">
                      {article.coverImageUrl ? (
                        <div className="relative h-44 overflow-hidden rounded-t-md">
                          <img
                            src={article.coverImageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-44 bg-accent rounded-t-md flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">No image</span>
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-1 gap-2">
                        <h2 className="font-semibold text-lg line-clamp-2" data-testid={`text-blog-title-${article.id}`}>
                          {article.title}
                        </h2>
                        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center justify-between gap-2 flex-wrap mt-auto pt-2">
                          {article.publishedAt && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                          )}
                          <span className="flex items-center gap-1 text-sm font-medium text-primary">
                            Read More
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No articles published yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

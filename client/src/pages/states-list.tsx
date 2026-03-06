import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { StateCard } from "@/components/state-card";
import { SEO } from "@/components/seo";
import { Search } from "lucide-react";
import type { State } from "@shared/schema";

export default function StatesList() {
  const { data: states, isLoading } = useQuery<State[]>({
    queryKey: ["/api/states"],
  });

  const [searchQuery, setSearchQuery] = useState("");

  const activeStates = states?.filter((s) => s.isActive) || [];
  const filteredStates = activeStates.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.abbreviation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <SEO
        title="Find Your State - Online Boater Education"
        description="Browse all available states and find your boater education course requirements."
      />
      <section className="bg-card border-b py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h1 className="font-serif text-3xl font-bold sm:text-4xl" data-testid="text-states-title">
            Find Your State
          </h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Browse all available states and find your boater education course requirements.
            Each state has unique rules about age, on-water assessments, and online completion.
          </p>

          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by state name or abbreviation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-states-page"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 15 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-3 flex items-center gap-3 flex-wrap">
                    <Skeleton className="h-10 w-10 rounded-md flex-shrink-0" />
                    <Skeleton className="h-4 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredStates.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredStates.map((state) => (
                <StateCard key={state.id} state={state} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                {searchQuery
                  ? `No states found matching "${searchQuery}"`
                  : "No states available yet."}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

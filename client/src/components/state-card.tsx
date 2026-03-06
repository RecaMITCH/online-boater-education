import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Users } from "lucide-react";
import type { State } from "@shared/schema";

interface StateCardProps {
  state: State;
}

export function StateCard({ state }: StateCardProps) {
  const getCertBadge = () => {
    if (state.minimumAgeOnlineOnly) {
      return (
        <Badge variant="outline" className="gap-1 flex-shrink-0" data-testid={`badge-cert-${state.slug}`}>
          <Users className="h-3 w-3" />
          {state.minimumAgeOnlineOnly}+ Online
        </Badge>
      );
    }
    if (state.fieldDayRequired) {
      return (
        <Badge variant="outline" className="gap-1 flex-shrink-0" data-testid={`badge-cert-${state.slug}`}>
          <Users className="h-3 w-3" />
          Online + In-Person
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1 flex-shrink-0" data-testid={`badge-cert-${state.slug}`}>
        <Award className="h-3 w-3" />
        {state.minimumAge ? `Online Only for Ages ${state.minimumAge}+` : 'Online Only'}
      </Badge>
    );
  };

  return (
    <Link href={`/states/${state.slug}`}>
      <Card className="group hover-elevate active-elevate-2 cursor-pointer h-full" data-testid={`card-state-${state.slug}`}>
        <CardContent className="p-3 flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-primary/10 font-bold text-sm" data-testid={`text-state-abbr-${state.slug}`}>
              {state.abbreviation}
            </div>
            <span className="font-medium text-sm truncate" data-testid={`text-state-name-${state.slug}`}>{state.name}</span>
          </div>
          {getCertBadge()}
        </CardContent>
      </Card>
    </Link>
  );
}

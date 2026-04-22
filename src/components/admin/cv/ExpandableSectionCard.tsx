import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExpandableSectionCardProps {
  title: string;
  icon: ReactNode;
  summary?: ReactNode;
  action?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  dataSectionId?: string;
}

export function ExpandableSectionCard({
  title,
  icon,
  summary,
  action,
  open,
  onToggle,
  children,
  className,
  contentClassName,
  dataSectionId,
}: ExpandableSectionCardProps) {
  return (
    <Card data-section-id={dataSectionId} className={className}>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={open}
        >
          <span className="text-primary">{icon}</span>
          <span className="min-w-0 flex-1">
            <CardTitle className="truncate">{title}</CardTitle>
            {summary ? (
              <span className="mt-1 block text-xs text-muted-foreground">
                {summary}
              </span>
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              open && "rotate-180",
            )}
          />
        </button>
        {action}
      </CardHeader>
      {open ? <CardContent className={contentClassName}>{children}</CardContent> : null}
    </Card>
  );
}

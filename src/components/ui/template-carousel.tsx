"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { TemplateOption } from "@/lib/constants/templates";

interface TemplateCarouselProps {
  templates: TemplateOption[];
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  desktopPerView?: number;
}

export function TemplateCarousel({
  templates,
  selectedTemplate,
  onSelectTemplate,
  desktopPerView = 4,
}: TemplateCarouselProps) {
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  const [desktopIndex, setDesktopIndex] = useState(0);

  const maxDesktopIndex = Math.max(0, templates.length - desktopPerView);
  const pageStarts = useMemo(
    () =>
      Array.from({ length: Math.ceil(templates.length / desktopPerView) }).map(
        (_, pageIndex) => Math.min(maxDesktopIndex, pageIndex * desktopPerView),
      ),
    [templates.length, desktopPerView, maxDesktopIndex],
  );
  const currentPageIndex = useMemo(() => {
    const index = pageStarts.findIndex((start) => start === desktopIndex);
    return index >= 0 ? index : 0;
  }, [desktopIndex, pageStarts]);

  const visibleDesktopTemplates = useMemo(
    () => templates.slice(desktopIndex, desktopIndex + desktopPerView),
    [templates, desktopIndex, desktopPerView],
  );
  const desktopGridClass =
    desktopPerView === 3
      ? "grid-cols-3"
      : desktopPerView === 2
        ? "grid-cols-2"
        : "grid-cols-4";

  const handleMobileScroll: React.UIEventHandler<HTMLDivElement> = (event) => {
    const container = event.currentTarget;
    const firstCard = container.querySelector<HTMLElement>("[data-template-card='true']");
    if (!firstCard) return;

    const step = firstCard.offsetWidth;
    if (step <= 0) return;

    const nextIndex = Math.max(
      0,
      Math.min(templates.length - 1, Math.round(container.scrollLeft / step)),
    );
    const nextTemplate = templates[nextIndex];

    if (nextTemplate && nextTemplate.id !== selectedTemplate) {
      onSelectTemplate(nextTemplate.id);
    }
  };

  const mobileIndex = useMemo(
    () => {
      const selectedIndex = templates.findIndex((template) => template.id === selectedTemplate);
      return selectedIndex >= 0 ? selectedIndex : 0;
    },
    [selectedTemplate, templates],
  );

  const scrollMobileToIndex = (nextIndex: number) => {
    const container = mobileScrollRef.current;
    const nextTemplate = templates[nextIndex];
    if (!container || !nextTemplate) return;

    onSelectTemplate(nextTemplate.id);
    container.scrollTo({
      left: container.clientWidth * nextIndex,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-3">
      <div className="md:hidden space-y-3">
        <div
          ref={mobileScrollRef}
          className="overflow-x-auto snap-x snap-mandatory scroll-smooth"
          onScroll={handleMobileScroll}
        >
          <div className="flex">
          {templates.map((template) => (
            <button
              key={template.id}
              data-template-card="true"
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              className={cn(
                "w-full shrink-0 snap-start p-2 border-2 rounded-lg transition-all cursor-pointer",
                selectedTemplate === template.id
                  ? "border-foreground bg-muted"
                  : "border-border hover:border-muted-foreground",
              )}
            >
              <div className="aspect-3/4 bg-muted rounded overflow-hidden">
                <img
                  src={template.img}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-center mt-2 font-medium">{template.name}</p>
            </button>
          ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => scrollMobileToIndex(Math.max(0, mobileIndex - 1))}
            disabled={mobileIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <div className="flex items-center gap-1">
            {templates.map((template, index) => (
              <button
                key={template.id}
                type="button"
                onClick={() => scrollMobileToIndex(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  mobileIndex === index ? "w-6 bg-foreground" : "w-2.5 bg-muted-foreground/30",
                )}
                aria-label={`Ir a la plantilla ${template.name}`}
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => scrollMobileToIndex(Math.min(templates.length - 1, mobileIndex + 1))}
            disabled={mobileIndex >= templates.length - 1}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setDesktopIndex((prev) => Math.max(0, prev - desktopPerView))}
          disabled={desktopIndex === 0}
          className="shrink-0 cursor-pointer disabled:cursor-not-allowed"
          type="button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className={cn("grid gap-3 flex-1", desktopGridClass)}>
          {visibleDesktopTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelectTemplate(template.id)}
              className={cn(
                "p-2 border-2 rounded-lg transition-all cursor-pointer",
                selectedTemplate === template.id
                  ? "border-foreground scale-[1.03]"
                  : "border-transparent hover:border-muted-foreground",
              )}
            >
              <div className="aspect-3/4 bg-muted rounded overflow-hidden">
                <img
                  src={template.img}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-xs text-center mt-1">{template.name}</p>
            </button>
          ))}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setDesktopIndex((prev) => Math.min(maxDesktopIndex, prev + desktopPerView))}
          disabled={desktopIndex >= maxDesktopIndex}
          className="shrink-0 cursor-pointer disabled:cursor-not-allowed"
          type="button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="hidden md:flex justify-center gap-1">
        {pageStarts.map((pageStart, pageIndex) => {
          return (
            <button
              key={pageIndex}
              type="button"
              onClick={() => setDesktopIndex(pageStart)}
              className={cn(
                "h-2 w-2 rounded-full transition-all cursor-pointer",
                currentPageIndex === pageIndex ? "bg-foreground" : "bg-muted-foreground/30",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}

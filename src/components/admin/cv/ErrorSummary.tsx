"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ErrorSummaryProps {
  errors: Record<string, string>;
  onErrorClick: (fieldPath: string) => void;
}

export function ErrorSummary({ errors, onErrorClick }: ErrorSummaryProps) {
  const entries = Object.entries(errors);

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50/60">
      <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <CardTitle className="text-base text-red-700">Revisá los campos marcados en rojo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.map(([fieldPath, message]) => (
          <Button
            key={fieldPath}
            type="button"
            variant="ghost"
            className="h-auto w-full justify-start whitespace-normal border border-red-200 bg-white px-3 py-2 text-left text-sm text-red-700 hover:bg-red-100"
            onClick={() => onErrorClick(fieldPath)}
          >
            <span className="font-medium">{fieldPath}</span>
            <span className="mx-2 text-red-300">·</span>
            <span>{message}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Send } from "lucide-react";
import { toast } from "sonner";
import { AITextExtractor } from "@/components/ui/ai-text-extractor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExtractedCVData } from "@/types";

const ADMIN_NEW_IA_SESSION_KEY = "admin-new-cv-ia-data";

export default function AdminNewCVIAPage() {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<ExtractedCVData | null>(null);

  const handleUseExtractedData = () => {
    if (!extractedData) {
      toast.error("Primero extraé datos con IA");
      return;
    }

    sessionStorage.setItem(ADMIN_NEW_IA_SESSION_KEY, JSON.stringify(extractedData));
    router.push("/admin/cv/new");
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin/cv/new")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al formulario
        </Button>

        <Card>
          <CardHeader className="items-center gap-3 text-center">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>Completar CV con IA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Subí un archivo de CV, una imagen o pegá texto. Revisá los datos extraídos y aplicalos al formulario.
            </p>
            <AITextExtractor onDataExtracted={setExtractedData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vista previa de datos extraídos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {extractedData ? (
              <>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Nombre</span>
                  <span className="text-right">{extractedData.fullName || "No detectado"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Teléfono</span>
                  <span className="text-right">{extractedData.phone || "No detectado"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <span className="text-right">{extractedData.email || "No detectado"}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Experiencias</span>
                  <span>{extractedData.experience.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Educación</span>
                  <span>{extractedData.education.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Habilidades</span>
                  <span>{extractedData.skills.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Idiomas</span>
                  <span>{extractedData.languages.length}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Certificaciones</span>
                  <span>{extractedData.certifications?.length ?? 0}</span>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                Todavía no hay datos extraídos. Usá el bloque superior para procesar archivo, imagen o texto.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleUseExtractedData} className="gap-2" disabled={!extractedData}>
            <Send className="h-4 w-4" />
            Usar datos en el formulario
          </Button>
        </div>
      </div>
    </div>
  );
}

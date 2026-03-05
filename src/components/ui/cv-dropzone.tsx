"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { extractCVAction } from "@/app/actions/ia";
import type { Experience, Education, Language } from "@/types";
import { cn } from "@/lib/utils/cn";

interface CVDropzoneProps {
  onDataExtracted?: (data: ExtractedCVData) => void;
  className?: string;
}

export interface ExtractedCVData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  languages: Language[];
}

export function CVDropzone({ onDataExtracted, className }: CVDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<"idle" | "processing" | "success" | "error">("idle");

  const processFile = useCallback(async (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    
    if (!validTypes.includes(file.type)) {
      toast.error("Tipo de archivo no válido. Solo PDF, JPEG, PNG o WebP");
      return;
    }

    setIsProcessing(true);
    setUploadProgress("processing");

    try {
      const result = await extractCVAction(file);

      if (result.success && result.extracted) {
        setUploadProgress("success");
        toast.success("CV procesado correctamente");
        
        if (onDataExtracted) {
          onDataExtracted({
            fullName: result.extracted.fullName || "",
            email: result.extracted.email || "",
            phone: result.extracted.phone || "",
            location: result.extracted.location || "",
            summary: result.extracted.summary || "",
            experience: result.extracted.experience || [],
            education: result.extracted.education || [],
            skills: result.extracted.skills || [],
            languages: result.extracted.languages || [],
          });
        }
      } else {
        setUploadProgress("error");
        toast.error(result.error || "Error al procesar el CV");
      }
    } catch (error) {
      setUploadProgress("error");
      console.error("Error processing CV:", error);
      toast.error("Error al procesar el CV");
    } finally {
      setIsProcessing(false);
    }
  }, [onDataExtracted]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">
        Importar CV anterior (opcional)
      </label>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging && "border-primary bg-primary/5",
          !isDragging && "border-muted-foreground/25 hover:border-muted-foreground/50",
          isProcessing && "pointer-events-none opacity-50"
        )}
      >
        <input
          type="file"
          accept=".pdf,image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id="cv-dropzone"
          disabled={isProcessing}
        />
        
        <label htmlFor="cv-dropzone" className="cursor-pointer">
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Procesando CV...</p>
            </div>
          ) : uploadProgress === "success" ? (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-sm text-green-600">CV importado correctamente</p>
              <p className="text-xs text-muted-foreground">Los datos se han completado automáticamente</p>
            </div>
          ) : uploadProgress === "error" ? (
            <div className="flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <p className="text-sm text-red-600">Error al procesar</p>
              <p className="text-xs text-muted-foreground">Intenta con otro archivo</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Arrastra tu CV aquí o haz clic para seleccionar
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, JPEG, PNG o WebP
              </p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}

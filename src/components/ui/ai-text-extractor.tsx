"use client";

import { useCallback, useState } from "react";
import { Upload, Loader2, AlertCircle, CheckCircle, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { extractCVAction, extractFromTextAction } from "@/app/actions/ia";
import type { Experience, Education, Language } from "@/types";
import { cn } from "@/lib/utils/cn";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AITextExtractorProps {
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

type ProcessingStatus = "idle" | "processing" | "success" | "error";

export function AITextExtractor({ onDataExtracted, className }: AITextExtractorProps) {
  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Tipo de archivo no válido. Solo PDF, JPEG, PNG o WebP");
        return;
      }
      setFile(selectedFile);
      setStatus("idle");
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setFile(null);
    setStatus("idle");
  }, []);

  const processData = useCallback(async () => {
    const hasFile = file !== null;
    const hasText = textInput.trim().length > 0;

    if (!hasFile && !hasText) {
      toast.error("Subí un archivo o escribí los datos del CV");
      return;
    }

    setIsProcessing(true);
    setStatus("processing");
    setErrorMessage("");

    try {
      let result;

      if (hasFile && hasText) {
        const fileResult = await extractCVAction(file);
        const textResult = await extractFromTextAction(textInput);
        
        if (fileResult.success && fileResult.extracted) {
          result = fileResult;
        } else if (textResult.success && textResult.extracted) {
          result = textResult;
        } else {
          throw new Error(fileResult.error || textResult.error || "Error al procesar");
        }
      } else if (hasFile) {
        result = await extractCVAction(file);
      } else {
        result = await extractFromTextAction(textInput);
      }

      if (result.success && result.extracted) {
        setStatus("success");
        toast.success("Datos extraídos correctamente");

        if (onDataExtracted) {
          const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          const experience = (result.extracted.experience || []).map((exp: any) => ({
            id: exp.id || generateId(),
            company: exp.company || "",
            position: exp.position || "",
            startDate: exp.startDate || "",
            endDate: exp.endDate || "",
            current: exp.current || false,
            description: exp.description || "",
          }));

          const education = (result.extracted.education || []).map((edu: any) => ({
            id: edu.id || generateId(),
            institution: edu.institution || "",
            degree: edu.degree || "",
            field: edu.field || "",
            startDate: edu.startDate || "",
            endDate: edu.endDate || "",
            current: edu.current || false,
            provincia: "",
            municipio: "",
            localidad: "",
          }));

          const languages = (result.extracted.languages || []).map((lang: any) => ({
            id: lang.id || generateId(),
            language: lang.language || "",
            level: lang.level || "",
          }));

          const seenSkills = new Set<string>();
          const skills = (result.extracted.skills || []).filter((skill: string) => {
            const normalizedSkill = skill.toLowerCase().trim();
            if (seenSkills.has(normalizedSkill)) return false;
            seenSkills.add(normalizedSkill);
            return true;
          });

          onDataExtracted({
            fullName: result.extracted.fullName || "",
            email: result.extracted.email || "",
            phone: result.extracted.phone || "",
            location: result.extracted.location || "",
            summary: result.extracted.summary || "",
            experience,
            education,
            skills,
            languages,
          });
        }
      } else {
        setStatus("error");
        setErrorMessage(result.error || "Error al procesar");
        toast.error(result.error || "Error al procesar el CV");
      }
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error.message || "Error desconocido");
      toast.error(error.message || "Error al procesar");
    } finally {
      setIsProcessing(false);
    }
  }, [file, textInput, onDataExtracted]);

  const hasFile = file !== null;
  const hasText = textInput.trim().length > 0;
  const hasAnyInput = hasFile || hasText;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Subir CV (PDF o imagen) - Opcional
        </Label>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
            hasFile ? "border-green-500 bg-green-500/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          {hasFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium truncate max-w-[200px]">{file?.name}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1 hover:bg-muted rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-2 cursor-pointer">
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <Upload className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Arrastrá el CV o hacé clic para seleccionar
              </span>
              <span className="text-xs text-muted-foreground">
                PDF, JPEG, PNG hasta 1MB
              </span>
            </label>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-4 left-0 right-0 flex items-center gap-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">O</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Escribir datos del CV - Opcional
        </Label>
        <Textarea
          placeholder={`Nombre: Juan Pérez
Teléfono: 11 1234 5678
Email: juan@email.com
Ubicación: Buenos Aires, Argentina

Experiencia:
- Desarrollador Frontend en TechCorp (2020-Actualidad)
- Encargado de tienda en LocalStore (2018-2020)

Educación:
- Lic. en Sistemas en UBA (2014-2018)

Skills:
- JavaScript, React, Node.js, TypeScript`}
          value={textInput}
          onChange={(e) => {
            setTextInput(e.target.value);
            setStatus("idle");
          }}
          rows={6}
          disabled={isProcessing}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          Escribí todos los datos que tengas: nombre, teléfono, estudios, experiencia laboral, skills, etc.
        </p>
      </div>

      <Button
        onClick={processData}
        disabled={isProcessing || !hasAnyInput}
        className="w-full"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Procesando con IA...
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle className="h-4 w-4 mr-2" />
            Datos extraídos
          </>
        ) : status === "error" ? (
          <>
            <AlertCircle className="h-4 w-4 mr-2" />
            Intentar de nuevo
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            Extraer datos con IA
          </>
        )}
      </Button>

      {status === "error" && errorMessage && (
        <p className="text-sm text-destructive text-center">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
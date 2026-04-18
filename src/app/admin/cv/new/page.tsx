"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LocationSelector } from "@/components/admin/cv/LocationSelector";
import { ErrorSummary } from "@/components/admin/cv/ErrorSummary";
import {
  ArrowLeft,
  Plus,
  X,
  CheckCircle,
  ArrowRight,
  Upload,
  Send,
  ShieldCheck,
  BookOpen,
  Zap,
  Globe,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { cn, generateId } from "@/lib/utils/cn";
import { createCV } from "@/app/actions/cv";
import { uploadImage } from "@/app/actions/upload";
import {
  languageSelectOptions,
  levelSelectOptions,
  availabilityOptions,
  monthSelectOptions,
  yearSelectOptions,
  registroSteps,
  ADMIN_NEW_DEFAULT_TEMPLATE_SETTINGS,
  EDUCATION_STATUS_OPTIONS,
} from "@/lib/constants";
import {
  getTemplatePalette,
  sanitizeTemplatePrimaryColor,
  templateOptions,
} from "@/lib/constants/templates";
import { ExperienceLocationSelector } from "@/components/admin/cv/ExperienceLocationSelector";
import { EducationLocationSelector } from "@/components/admin/cv/EducationLocationSelector";
import type {
  TemplateType,
  Experience,
  Education,
  Language,
  Certification,
  ExtractedCVData,
} from "@/types";
import { TemplateCarousel } from "@/components/ui/template-carousel";
import { buildFullName, splitFullName, validateCVPayload } from "@/lib/validations";
import { validateImageFile } from "@/lib/validations/files";

const ADMIN_NEW_IA_SESSION_KEY = "admin-new-cv-ia-data";
const STEP_ERROR_PREFIXES: Record<number, string[]> = {
  1: ["name", "lastName", "phone", "email", "dni", "fechaNacimiento", "location", "links"],
  2: ["photo"],
  3: ["experience"],
  4: ["education"],
  5: ["certifications"],
  6: ["skills", "languages"],
  7: ["summary", "targetJob", "licencia", "movilidad", "incorporacionInmediata", "disponibilidad", "office"],
  8: ["selectedTemplate", "templateSettings"],
  9: [],
};

export default function AdminNewCVPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    fullName: "",
    phone: "",
    dni: "",
    fechaNacimiento: "",
    email: "",
    location: "",
    links: "",
    summary: "",
    photo: "",
    licencia: "",
    movilidad: false,
    incorporacionInmediata: false,
    disponibilidad: "fullTime",
    office: false,
    experience: [] as Experience[],
    education: [] as Education[],
    skills: [] as string[],
    languages: [] as Language[],
    certifications: [] as Certification[],
    selectedTemplate: "harvard" as TemplateType,
    templateSettings: ADMIN_NEW_DEFAULT_TEMPLATE_SETTINGS,
    targetJob: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validateRealtime = useCallback((nextData: typeof formData) => {
    const validation = validateCVPayload(nextData);
    setFieldErrors(validation.success ? {} : validation.errors);

    return validation.success;
  }, [setFieldErrors]);

  const updateFormData = useCallback((data: Partial<typeof formData>, touchedPath?: string) => {
    setFormData((prev) => {
      const merged = { ...prev, ...data };
      merged.fullName = buildFullName(merged.name, merged.lastName);
      validateRealtime(merged);
      return merged;
    });

    if (touchedPath) {
      setTouchedFields((prev) => ({ ...prev, [touchedPath]: true }));
    }
  }, [validateRealtime]);

  const getFieldError = useCallback((path: string) => {
    if (!submitAttempted && !touchedFields[path]) {
      return "";
    }

    return fieldErrors[path] ?? "";
  }, [fieldErrors, submitAttempted, touchedFields]);

  const visibleErrorKeys = useMemo(() => {
    const errorKeys = Object.keys(fieldErrors);
    if (submitAttempted) {
      return errorKeys;
    }

    return errorKeys.filter((key) => touchedFields[key]);
  }, [fieldErrors, submitAttempted, touchedFields]);

  const stepHasVisibleError = useCallback((stepId: number) => {
    const prefixes = STEP_ERROR_PREFIXES[stepId] ?? [];
    if (prefixes.length === 0) {
      return false;
    }

    return visibleErrorKeys.some((errorPath) =>
      prefixes.some((prefix) => errorPath === prefix || errorPath.startsWith(`${prefix}.`)),
    );
  }, [visibleErrorKeys]);

  const scrollToField = useCallback((fieldPath: string) => {
    if (typeof document === "undefined") {
      return;
    }

    const exactTarget = document.querySelector(`[data-field-id="${fieldPath}"]`) as HTMLElement | null;
    const sectionTarget = document.querySelector(`[data-section-id="${fieldPath.split(".")[0]}"]`) as HTMLElement | null;
    const target = exactTarget ?? sectionTarget;

    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const availableTemplateColors = getTemplatePalette(formData.selectedTemplate);

  const handleTemplateSelection = (templateId: string) => {
    const nextTemplate = templateId as TemplateType;
    const nextColor = sanitizeTemplatePrimaryColor(
      nextTemplate,
      formData.templateSettings.primaryColor,
    );

    updateFormData({
      selectedTemplate: nextTemplate,
      templateSettings: {
        ...formData.templateSettings,
        primaryColor: nextColor,
      },
    });
  };


  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processPhotoFile(file);
  };

  const processPhotoFile = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(formData);
    if (result.success && result.url) {

      updateFormData({ photo: result.url });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processPhotoFile(file);
    }
  };

  const addExperience = () => {
    updateFormData({
      experience: [
        ...formData.experience,
        {
          id: generateId(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
          provincia: "",
          municipio: "",
          localidad: "",
        },
      ],
    });
  };

  const removeExperience = (id: string) => {
    updateFormData({
      experience: formData.experience.filter((e) => e.id !== id),
    });
  };

  const updateExperience = (id: string, field: string, value: unknown) => {
    const index = formData.experience.findIndex((e) => e.id === id);
    updateFormData({
      experience: formData.experience.map((e) =>
        e.id === id
          ? {
              ...e,
              [field]: value,
              ...(field === "current" && value === true ? { endDate: "" } : {}),
            }
          : e,
      ),
    }, index >= 0 ? `experience.${index}.${field}` : undefined);
  };

  const updateExperienceLocation = (id: string, locationData: { provincia: string; municipio: string; localidad: string }) => {
    updateFormData({
      experience: formData.experience.map((e) =>
        e.id === id ? { ...e, ...locationData } : e,
      ),
    });
  };

  const addEducation = () => {
    updateFormData({
      education: [
        ...formData.education,
        {
          id: generateId(),
          institution: "",
          degree: "",
          status: "complete",
          startDate: "",
          endDate: "",
          provincia: "",
          municipio: "",
          localidad: "",
        },
      ],
    });
  };

  const removeEducation = (id: string) => {
    updateFormData({
      education: formData.education.filter((e) => e.id !== id),
    });
  };

  const updateEducation = (id: string, field: string, value: unknown) => {
    const index = formData.education.findIndex((e) => e.id === id);
    updateFormData({
      education: formData.education.map((e) =>
        e.id === id
          ? {
              ...e,
              [field]: value,
              ...(field === "status" && value === "in_progress" ? { endDate: "" } : {}),
            }
          : e,
      ),
    }, index >= 0 ? `education.${index}.${field}` : undefined);
  };

  const updateEducationLocation = (id: string, locationData: { provincia: string; municipio: string; localidad: string }) => {
    updateFormData({
      education: formData.education.map((e) =>
        e.id === id ? { ...e, ...locationData } : e,
      ),
    });
  };

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    if (!formData.skills.includes(skill.trim())) {
      updateFormData({ skills: [...formData.skills, skill.trim()] });
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData({ skills: formData.skills.filter((s) => s !== skill) });
  };

  const addLanguage = () => {
    updateFormData({
      languages: [
        ...formData.languages,
        { id: generateId(), language: "", level: "" },
      ],
    });
  };

  const addCertification = () => {
    updateFormData({
      certifications: [
        ...formData.certifications,
        {
          id: generateId(),
          title: "",
          institution: "",
          startMonth: "",
          startYear: "",
          name: "",
          issuer: "",
          date: "",
        },
      ],
    });
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    const index = formData.certifications.findIndex((item) => item.id === id);
    updateFormData({
      certifications: formData.certifications.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              ...(field === "title" ? { name: value } : {}),
              ...(field === "institution" ? { issuer: value } : {}),
            }
          : item,
      ),
    }, index >= 0 ? `certifications.${index}.${String(field)}` : undefined);
  };

  const removeCertification = (id: string) => {
    updateFormData({
      certifications: formData.certifications.filter((item) => item.id !== id),
    });
  };

  const removeLanguage = (id: string) => {
    const nextLanguages = formData.languages.filter((l) => l.id !== id);
    updateFormData({
      languages: nextLanguages,
    });
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    const index = formData.languages.findIndex((language) => language.id === id);
    updateFormData({
      languages: formData.languages.map((l) =>
        l.id === id ? { ...l, [field]: value } : l,
      ),
    }, index >= 0 ? `languages.${index}.${field}` : undefined);
  };

  const handleDataExtracted = useCallback((data: ExtractedCVData) => {
    const splitName = splitFullName(data.fullName || "");

    setFormData((prev) => ({
      ...prev,
      name: splitName.name || prev.name,
      lastName: splitName.lastName || prev.lastName,
      fullName: buildFullName(splitName.name || prev.name, splitName.lastName || prev.lastName),
      phone: data.phone || prev.phone,
      email: data.email || prev.email,
      fechaNacimiento: data.fechaNacimiento || prev.fechaNacimiento,
      location: data.location || prev.location,
      summary: data.summary || prev.summary,
      experience:
        data.experience.length > 0 ? data.experience : prev.experience,
      education: data.education.length > 0 ? data.education : prev.education,
      skills: data.skills.length > 0 ? data.skills : prev.skills,
      languages: data.languages.length > 0 ? data.languages : prev.languages,
      certifications: data.certifications && data.certifications.length > 0
        ? data.certifications
        : prev.certifications,
      licencia: data.licencia ?? prev.licencia,
      movilidad: typeof data.movilidad === "boolean" ? data.movilidad : prev.movilidad,
      incorporacionInmediata: typeof data.incorporacionInmediata === "boolean"
        ? data.incorporacionInmediata
        : prev.incorporacionInmediata,
      office: typeof data.office === "boolean" ? data.office : prev.office,
      disponibilidad: data.disponibilidad === "partTime"
        ? "partTime"
        : data.disponibilidad === "fullTime"
          ? "fullTime"
          : prev.disponibilidad,
    }));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const pendingData = sessionStorage.getItem(ADMIN_NEW_IA_SESSION_KEY);
    if (!pendingData) {
      return;
    }

    try {
      const parsed = JSON.parse(pendingData) as ExtractedCVData;
      handleDataExtracted(parsed);
      toast.success("Se cargaron los datos extraídos por IA");
    } catch {
      toast.error("No se pudieron recuperar los datos de IA");
    } finally {
      sessionStorage.removeItem(ADMIN_NEW_IA_SESSION_KEY);
    }
  }, [handleDataExtracted]);

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const validation = validateCVPayload(formData);
    setFieldErrors(validation.success ? {} : validation.errors);

    if (!validation.success) {
      scrollToField(Object.keys(validation.errors)[0] ?? "");
      toast.error("Revisá los campos marcados en rojo");
      return;
    }

    setLoading(true);
    try {
      const finalTemplateSettings = {
        ...formData.templateSettings,
        primaryColor: formData.templateSettings.primaryColor || "#1e3a5f",
        headerBackground: formData.templateSettings.primaryColor || "#1e3a5f",
      };
      
      const result: { success: boolean; id?: string; error?: string } =
        await createCV({
          ...formData,
          fullName: buildFullName(formData.name, formData.lastName),
          templateSettings: finalTemplateSettings,
        });
      if (result.success && result.id) {
        toast.success("CV creado correctamente");
        router.push("/admin");
      } else {
        toast.error(result.error || "Error al crear CV");
      }
    } catch (error) {
      console.error("Error creating CV:", error);
      toast.error("Error al crear CV");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !fieldErrors.name && !fieldErrors.lastName && !fieldErrors.phone && !!formData.name && !!formData.lastName && !!formData.phone;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return true;
      case 6:
        return formData.selectedTemplate;
      case 7:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al panel
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Nuevo CV</h1>
          <p className="text-sm md:text-base text-muted-foreground px-2">
            Crear un nuevo currículum
          </p>
        </motion.div>

        {submitAttempted && Object.keys(fieldErrors).length > 0 ? (
          <div className="mb-6">
            <ErrorSummary errors={fieldErrors} onErrorClick={scrollToField} />
          </div>
        ) : null}

        <div className="hidden md:flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
            {registroSteps.map((step, index) => {
              const hasStepError = stepHasVisibleError(step.id);

              return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                  title={step.title}
                  aria-label={`Paso ${step.id}: ${step.title}`}
                  className={cn(
                    "flex items-center justify-center px-2 py-2 rounded-lg transition-all text-sm font-medium",
                    hasStepError
                      ? currentStep === step.id
                        ? "bg-red-600 text-white"
                        : "bg-red-100 text-red-700"
                      : currentStep === step.id
                        ? "bg-foreground text-background"
                        : step.id < currentStep
                          ? "bg-muted text-foreground cursor-pointer hover:bg-muted/80"
                          : "bg-muted/50 text-muted-foreground cursor-not-allowed",
                  )}
                  disabled={step.id > currentStep}
                >
                  <step.icon className="md:size-4 size-7" />
                </button>
                {index < registroSteps.length - 1 && (
                  <div className="w-8 h-0.5 bg-border mx-2" />
                )}
              </div>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card data-section-id="personal">
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <User className="h-5 w-5 text-primary" />
                      <CardTitle>Datos personales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/cv/new/ia")}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Agregar con IA
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre *</Label>
                          <Input
                            value={formData.name}
                            onChange={(e) =>
                              updateFormData({ name: e.target.value }, "name")
                            }
                            placeholder="Juan"
                            autoComplete="given-name"
                            inputMode="text"
                            className={cn(getFieldError("name") && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError("name") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("name")}</p>
                          )}
                        </div>
                        <div>
                          <Label>Apellido *</Label>
                          <Input
                            value={formData.lastName}
                            onChange={(e) =>
                              updateFormData({ lastName: e.target.value }, "lastName")
                            }
                            placeholder="Pérez"
                            autoComplete="family-name"
                            inputMode="text"
                            className={cn(getFieldError("lastName") && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError("lastName") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("lastName")}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Teléfono *</Label>
                          <Input
                            value={formData.phone}
                            onChange={(e) =>
                              updateFormData({ phone: e.target.value }, "phone")
                            }
                            placeholder="+54 11 1234 5678"
                            autoComplete="tel"
                            inputMode="numeric"
                            className={cn(getFieldError("phone") && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError("phone") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("phone")}</p>
                          )}
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              updateFormData({ email: e.target.value }, "email")
                            }
                            placeholder="juan@email.com"
                            autoComplete="email"
                            inputMode="email"
                            className={cn(getFieldError("email") && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError("email") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("email")}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>DNI (opcional)</Label>
                          <Input
                            value={formData.dni}
                            onChange={(e) =>
                              updateFormData({ dni: e.target.value }, "dni")
                            }
                            placeholder="12.345.678"
                            inputMode="numeric"
                            className={cn(getFieldError("dni") && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError("dni") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("dni")}</p>
                          )}
                        </div>
                        <div>
                          <Label>Fecha de nacimiento (opcional)</Label>
                          <Input
                            type="date"
                            value={formData.fechaNacimiento || ""}
                            onChange={(e) =>
                              updateFormData({ fechaNacimiento: e.target.value }, "fechaNacimiento")
                            }
                            max={new Date().toISOString().split("T")[0]}
                            className={cn(getFieldError("fechaNacimiento") && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError("fechaNacimiento") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("fechaNacimiento")}</p>
                          )}
                        </div>
                        <div>
                          {!showLocation ? (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowLocation(true)}
                              className="w-full"
                            >
                              <span className="mr-2">📍</span>
                              Agregar ubicación
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <LocationSelector
                                value={
                                  formData.location
                                    ? (() => {
                                        const parts = formData.location
                                          .split(", ")
                                          .map((item) => item.trim())
                                          .filter(Boolean);

                                        if (parts.length >= 3) {
                                          return {
                                            localidad: parts[0] || "",
                                            municipio: parts[1] || "",
                                            provincia: parts[2] || "",
                                          };
                                        }

                                        return {
                                          localidad: "",
                                          municipio: parts[0] || "",
                                          provincia: parts[1] || "",
                                        };
                                      })()
                                    : undefined
                                }
                                onChange={(locationData) => {
                                  const nextLocation = [
                                    locationData.municipio,
                                    locationData.provincia,
                                  ]
                                    .filter(Boolean)
                                    .join(", ");
                                  updateFormData({ location: nextLocation }, "location");
                                }}
                              />
                              <p className="text-xs text-muted-foreground">
                                Seleccioná provincia y municipio/localidad.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {!showLinks ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLinks(true)}
                          className="w-full"
                        >
                          Agregar links relevantes
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Label>Links relevantes</Label>
                          <Textarea
                            value={formData.links}
                            onChange={(e) =>
                              updateFormData({ links: e.target.value }, "links")
                            }
                            placeholder="linkedin.com/in/tu-perfil, github.com/tu-usuario"
                            className={cn(getFieldError("links") && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError("links") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("links")}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Separa varios links con comas
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card data-section-id="photo">
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <CardTitle>Foto de Perfil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center gap-4">
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={cn(
                            "relative w-32 h-32 rounded-full overflow-hidden border-2 transition-all cursor-pointer",
                            isDraggingPhoto
                              ? "border-primary border-dashed scale-105"
                              : "border-transparent",
                          )}
                        >
                          {photoPreview || formData.photo ? (
                            <Image
                              src={photoPreview || formData.photo}
                              alt="Foto"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-xs text-center p-2">
                                Sin foto
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Arrastra una imagen o haz clic para seleccionar
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG hasta 1MB
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card data-section-id="experience">
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <CardTitle>Experiencia Laboral</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addExperience}
                        className="ml-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.experience.map((exp, index) => (
                        <div
                          key={exp.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex justify-between">
                            <Label className="text-xs text-muted-foreground">
                              Empresa
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(exp.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={exp.company}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "company",
                                e.target.value,
                              )
                            }
                            placeholder="Nombre de la empresa"
                            className={cn(getFieldError(`experience.${index}.company`) && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError(`experience.${index}.company`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`experience.${index}.company`)}</p>
                          )}
                          <Input
                            value={exp.position}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "position",
                                e.target.value,
                              )
                            }
                            placeholder="Puesto"
                            className={cn(getFieldError(`experience.${index}.position`) && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError(`experience.${index}.position`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`experience.${index}.position`)}</p>
                          )}
                          <ExperienceLocationSelector
                            experienciaId={exp.id}
                            initialProvincia={exp.provincia}
                            initialMunicipio={exp.municipio}
                            initialLocalidad={exp.localidad}
                            onChange={updateExperienceLocation}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="date"
                              value={exp.startDate}
                              onChange={(e) =>
                                updateExperience(
                                  exp.id,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                              className={cn(getFieldError(`experience.${index}.startDate`) && "border-red-500 focus-visible:ring-red-500")}
                            />
                            <Input
                              type="date"
                              value={exp.endDate}
                              onChange={(e) =>
                                updateExperience(
                                  exp.id,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                              disabled={exp.current}
                              className={cn(getFieldError(`experience.${index}.endDate`) && "border-red-500 focus-visible:ring-red-500")}
                            />
                          </div>
                          {getFieldError(`experience.${index}.startDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`experience.${index}.startDate`)}</p>
                          )}
                          {getFieldError(`experience.${index}.endDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`experience.${index}.endDate`)}</p>
                          )}
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) =>
                                updateExperience(
                                  exp.id,
                                  "current",
                                  e.target.checked,
                                )
                              }
                            />
                            <span className="text-sm">Trabajo actual</span>
                          </label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "description",
                                e.target.value,
                              )
                            }
                            placeholder="Descripción de funciones..."
                            className="h-20"
                          />
                        </div>
                      ))}
                      {formData.experience.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No hay experiencias agregadas
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card data-section-id="education">
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <CardTitle>Educación</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addEducation}
                        className="ml-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.education.map((edu, index) => (
                        <div
                          key={edu.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex justify-between">
                            <Label className="text-xs text-muted-foreground">
                              Institución
                            </Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={edu.institution}
                            onChange={(e) =>
                              updateEducation(
                                edu.id,
                                "institution",
                                e.target.value,
                              )
                            }
                            placeholder="Universidad/Instituto"
                            className={cn(getFieldError(`education.${index}.institution`) && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError(`education.${index}.institution`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.institution`)}</p>
                          )}
                          <Input
                            value={edu.degree}
                            onChange={(e) =>
                              updateEducation(edu.id, "degree", e.target.value)
                            }
                            placeholder="Carrera/TÃ­tulo"
                            className={cn(getFieldError(`education.${index}.degree`) && "border-red-500 focus-visible:ring-red-500")}
                          />
                          {getFieldError(`education.${index}.degree`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.degree`)}</p>
                          )}
                          <EducationLocationSelector
                            educacionId={edu.id}
                            initialProvincia={edu.provincia}
                            initialMunicipio={edu.municipio}
                            initialLocalidad={edu.localidad}
                            onChange={updateEducationLocation}
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="date"
                              value={edu.startDate}
                              onChange={(e) =>
                                updateEducation(
                                  edu.id,
                                  "startDate",
                                  e.target.value,
                                )
                              }
                              className={cn(getFieldError(`education.${index}.startDate`) && "border-red-500 focus-visible:ring-red-500")}
                            />
                            <Input
                              type="date"
                              value={edu.endDate}
                              onChange={(e) =>
                                updateEducation(
                                  edu.id,
                                  "endDate",
                                  e.target.value,
                                )
                              }
                                disabled={edu.status === "in_progress"}
                              className={cn(getFieldError(`education.${index}.endDate`) && "border-red-500 focus-visible:ring-red-500")}
                            />
                          </div>
                          {getFieldError(`education.${index}.startDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.startDate`)}</p>
                          )}
                          {getFieldError(`education.${index}.endDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.endDate`)}</p>
                          )}
                          <div>
                            <Label>Estado del estudio *</Label>
                            <Select
                              value={edu.status}
                              onChange={(e) =>
                                updateEducation(edu.id, "status", e.target.value)
                              }
                              options={EDUCATION_STATUS_OPTIONS}
                              className={cn(getFieldError(`education.${index}.status`) && "border-red-500 focus-visible:ring-red-500")}
                            />
                            {getFieldError(`education.${index}.status`) && (
                              <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.status`)}</p>
                            )}
                          </div>
                        </div>
                      ))}
                      {formData.education.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          No hay estudios agregados
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card data-section-id="certifications">
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <BookOpen className="h-5 w-5 text-primary" />
                      <CardTitle>Cursos y certificaciones</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-auto"
                        onClick={addCertification}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.certifications.length > 0 ? (
                        <div className="space-y-3">
                          {formData.certifications.map((course, index) => (
                            <div key={course.id} className="rounded-md border p-3 space-y-3">
                              <div className="flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeCertification(course.id)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-3">
                                <div className="grid gap-3 md:grid-cols-2">
                                  <div>
                                    <Label>Título del curso</Label>
                                    <Input
                                      data-field-id={`certifications.${index}.title`}
                                      value={course.title ?? ""}
                                      onChange={(e) =>
                                        updateCertification(course.id, "title", e.target.value)
                                      }
                                      className={cn(
                                        getFieldError(`certifications.${index}.title`) &&
                                          "border-red-500 focus-visible:ring-red-500",
                                      )}
                                    />
                                    {getFieldError(`certifications.${index}.title`) && (
                                      <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                        {getFieldError(`certifications.${index}.title`)}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <Label>Institución</Label>
                                    <Input
                                      data-field-id={`certifications.${index}.institution`}
                                      value={course.institution ?? ""}
                                      onChange={(e) =>
                                        updateCertification(course.id, "institution", e.target.value)
                                      }
                                      className={cn(
                                        getFieldError(`certifications.${index}.institution`) &&
                                          "border-red-500 focus-visible:ring-red-500",
                                      )}
                                    />
                                    {getFieldError(`certifications.${index}.institution`) && (
                                      <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                        {getFieldError(`certifications.${index}.institution`)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                  <div>
                                    <Label>Mes de inicio</Label>
                                    <Select
                                      data-field-id={`certifications.${index}.startMonth`}
                                      value={course.startMonth ?? ""}
                                      onChange={(e) =>
                                        updateCertification(course.id, "startMonth", e.target.value)
                                      }
                                      options={monthSelectOptions}
                                      placeholder="Seleccionar mes"
                                      className={cn(
                                        getFieldError(`certifications.${index}.startMonth`) &&
                                          "border-red-500 focus-visible:ring-red-500",
                                      )}
                                    />
                                    {getFieldError(`certifications.${index}.startMonth`) && (
                                      <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                        {getFieldError(`certifications.${index}.startMonth`)}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <Label>Año de inicio</Label>
                                    <Select
                                      data-field-id={`certifications.${index}.startYear`}
                                      value={course.startYear ?? ""}
                                      onChange={(e) =>
                                        updateCertification(course.id, "startYear", e.target.value)
                                      }
                                      options={yearSelectOptions}
                                      placeholder="Seleccionar año"
                                      className={cn(
                                        getFieldError(`certifications.${index}.startYear`) &&
                                          "border-red-500 focus-visible:ring-red-500",
                                      )}
                                    />
                                    {getFieldError(`certifications.${index}.startYear`) && (
                                      <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                        {getFieldError(`certifications.${index}.startYear`)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Aún no agregaste cursos ni certificaciones.</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <Zap className="h-5 w-5 text-primary" />
                      <CardTitle>Habilidades</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Agregar habilidad"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addSkill((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.querySelector(
                              "input[placeholder='Agregar habilidad']",
                            ) as HTMLInputElement;
                            if (input) {
                              addSkill(input.value);
                              input.value = "";
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, index) => (
                          <Badge
                            key={`${skill}-${index}`}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeSkill(skill)}
                          >
                            {skill} <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                      {formData.skills.length === 0 && (
                        <p className="text-xs text-muted-foreground">Aún no agregaste habilidades.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <CardTitle>Idiomas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button variant="outline" size="sm" onClick={addLanguage} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar idioma
                      </Button>
                      <div className="space-y-3">
                        {formData.languages.map((lang, index) => (
                          <div key={lang.id} className="flex flex-col gap-2 rounded-md border bg-background p-3 sm:flex-row sm:items-center">
                            <Select
                              data-field-id={`languages.${index}.language`}
                              value={lang.language}
                              onChange={(e) =>
                                updateLanguage(
                                  lang.id,
                                  "language",
                                  e.target.value,
                                )
                              }
                              options={languageSelectOptions}
                              className={cn(
                                "flex-1",
                                getFieldError(`languages.${index}.language`) && "border-red-500 focus-visible:ring-red-500",
                              )}
                              placeholder="Idioma"
                            />
                            <Select
                              data-field-id={`languages.${index}.level`}
                              value={lang.level}
                              onChange={(e) =>
                                updateLanguage(lang.id, "level", e.target.value)
                              }
                              options={levelSelectOptions}
                              className={cn(
                                "sm:w-24",
                                getFieldError(`languages.${index}.level`) && "border-red-500 focus-visible:ring-red-500",
                              )}
                              placeholder="Nivel"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLanguage(lang.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {getFieldError(`languages.${index}.language`) && (
                              <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 sm:col-span-3">
                                {getFieldError(`languages.${index}.language`)}
                              </p>
                            )}
                            {getFieldError(`languages.${index}.level`) && (
                              <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600 sm:col-span-3">
                                {getFieldError(`languages.${index}.level`)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {formData.languages.length === 0 && (
                        <p className="text-xs text-muted-foreground">Aún no agregaste idiomas.</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 7 && (
                <motion.div
                  key="step7"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <ShieldCheck className="h-5 w-5 text-primary" />
                      <CardTitle>Información adicional</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-4">
                        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!formData.licencia}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateFormData({ licencia: "B" }, "licencia");
                              } else {
                                updateFormData({ licencia: "" }, "licencia");
                              }
                            }}
                          />
                          <span className="text-sm">Licencia</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!formData.movilidad}
                            onChange={(e) => updateFormData({ movilidad: e.target.checked }, "movilidad")}
                          />
                          <span className="text-sm">Movilidad propia</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!formData.incorporacionInmediata}
                            onChange={(e) =>
                              updateFormData({ incorporacionInmediata: e.target.checked }, "incorporacionInmediata")
                            }
                          />
                          <span className="text-sm">Incorporación inmediata</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!formData.office}
                            onChange={(e) => updateFormData({ office: e.target.checked }, "office")}
                          />
                          <span className="text-sm">Microsoft Office</span>
                        </label>
                      </div>
                      {formData.licencia && (
                        <div>
                          <Label>Tipo de licencia</Label>
                          <Input
                            value={formData.licencia}
                            onChange={(e) => updateFormData({ licencia: e.target.value }, "licencia")}
                            placeholder="Ej: B1, profesional, etc."
                          />
                        </div>
                      )}
                      <div>
                        <Label>Disponibilidad horaria</Label>
                        <Select
                          value={formData.disponibilidad || ""}
                          onChange={(e) =>
                            updateFormData(
                              { disponibilidad: e.target.value as "fullTime" | "partTime" },
                              "disponibilidad",
                            )
                          }
                          options={availabilityOptions}
                          placeholder="Seleccionar disponibilidad"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 8 && (
                <motion.div
                  key="step8"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <CardTitle>Diseño del CV</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label>Plantilla</Label>
                        <div className="mt-2">
                          <TemplateCarousel
                            templates={templateOptions}
                            selectedTemplate={formData.selectedTemplate}
                            onSelectTemplate={handleTemplateSelection}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Color del diseño</Label>
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {availableTemplateColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                updateFormData({
                                  templateSettings: {
                                    ...formData.templateSettings,
                                    primaryColor: color,
                                  },
                                })
                              }
                              className={cn(
                                "h-10 rounded-lg border-2 transition-all",
                                formData.templateSettings.primaryColor ===
                                  color
                                  ? "border-foreground scale-110"
                                  : "border-transparent hover:scale-105",
                              )}
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {currentStep === 9 && (
                <motion.div
                  key="step9"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <CardTitle>Confirmar Datos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Nombre:</span>
                          <span>{buildFullName(formData.name, formData.lastName) || "No especificado"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Teléfono:
                          </span>
                          <span>{formData.phone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Email:</span>
                          <span>{formData.email || "No especificado"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Experiencias:
                          </span>
                          <span>{formData.experience.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Educación:
                          </span>
                          <span>{formData.education.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Habilidades:
                          </span>
                          <span>{formData.skills.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Idiomas:
                          </span>
                          <span>{formData.languages.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
          </AnimatePresence>

          <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="flex gap-2"
              >
                <ArrowLeft className="w-4 h-4 " />
                <span>Anterior</span>
              </Button>

              {currentStep < registroSteps.length ? (
                <Button
                  onClick={() =>
                    setCurrentStep((prev) =>
                      Math.min(registroSteps.length, prev + 1),
                    )
                  }
                  disabled={!canProceed()}
                  className="flex gap-2"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} loading={loading}>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              )}
        </div>
      </div>
    </div>
  );
}

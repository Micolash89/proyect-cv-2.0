"use client";

import { useState, useCallback, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  X,
  FileText,
  Image as ImageIcon,
  Link2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  BookOpen,
  Zap,
  Globe,
  Sparkles,
  AlertTriangle,
  CarFront,
  BadgeCheck,
} from "lucide-react";
import { SiGithub, SiLinkerd, SiLibreofficewriter } from "@icons-pack/react-simple-icons";
import { cn, generateId } from "@/lib/utils/cn";
import { createCV } from "@/app/actions/cv";
import { uploadImage } from "@/app/actions/upload";
import { EducationLocationSelector } from "@/components/admin/cv/EducationLocationSelector";
import { ExperienceLocationSelector } from "@/components/admin/cv/ExperienceLocationSelector";
import { LocationSelector } from "@/components/admin/cv/LocationSelector";
import { TemplateCarousel } from "@/components/ui/template-carousel";
import { ErrorSummary } from "@/components/admin/cv/ErrorSummary";
import { ExpandableSectionCard } from "@/components/admin/cv/ExpandableSectionCard";
import type {
  Experience,
  Education,
  Language,
  TemplateType,
  CVFormDraft,
  Certification,
} from "@/types";
import {
  buildFullName,
  splitFullName,
  validateCVPayload,
} from "@/lib/validations";
import {
  getTemplatePalette,
  sanitizeTemplatePrimaryColor,
  templateOptions,
} from "@/lib/constants/templates";
import {
  languageSelectOptions,
  levelSelectOptions,
  availabilityOptions,
  monthSelectOptions,
  yearSelectOptions,
  registroSteps,
  REGISTRO_DEFAULT_FORM_DATA,
  EDUCATION_STATUS_OPTIONS,
} from "@/lib/constants";
import { buildTemplateSettingsDefaults } from "@/lib/constants/cv";
import { validateImageFile } from "@/lib/validations/files";

const STEP_ERROR_PREFIXES: Record<number, string[]> = {
  1: [
    "name",
    "lastName",
    "phone",
    "email",
    "dni",
    "fechaNacimiento",
    "location",
    "links",
  ],
  2: ["photo"],
  3: ["experience"],
  4: ["education"],
  5: ["certifications"],
  6: ["skills", "languages"],
  7: [
    "summary",
    "targetJob",
    "licencia",
    "movilidad",
    "incorporacionInmediata",
    "disponibilidad",
    "office",
  ],
  8: ["selectedTemplate", "templateSettings"],
  9: [],
};

function RegistroPageContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CVFormDraft>({
    ...REGISTRO_DEFAULT_FORM_DATA,
    languages: REGISTRO_DEFAULT_FORM_DATA.languages,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showLinks, setShowLinks] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [expandedReviewSections, setExpandedReviewSections] = useState<Record<string, boolean>>({
    experience: false,
    education: false,
    certifications: false,
    languages: false,
    skills: false,
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const validateRealtime = useCallback((nextData: CVFormDraft) => {
    const validation = validateCVPayload(nextData);
    setFieldErrors(validation.success ? {} : validation.errors);
    return validation.success;
  }, []);

  const updateFormData = useCallback(
    (data: Partial<CVFormDraft>, touchedPath?: string) => {
      setFormData((prev) => {
        const merged = { ...prev, ...data };
        merged.fullName = buildFullName(merged.name, merged.lastName);
        validateRealtime(merged);
        return merged;
      });

      if (touchedPath) {
        setTouchedFields((prev) => ({ ...prev, [touchedPath]: true }));
      }
    },
    [validateRealtime],
  );

  const getFieldError = useCallback(
    (path: string) => {
      if (!submitAttempted && !touchedFields[path]) {
        return "";
      }

      return fieldErrors[path] ?? "";
    },
    [fieldErrors, submitAttempted, touchedFields],
  );

  const visibleErrorKeys = useMemo(() => {
    const errorKeys = Object.keys(fieldErrors);
    if (submitAttempted) {
      return errorKeys;
    }

    return errorKeys.filter((key) => touchedFields[key]);
  }, [fieldErrors, submitAttempted, touchedFields]);

  const stepHasVisibleError = useCallback(
    (stepId: number) => {
      const prefixes = STEP_ERROR_PREFIXES[stepId] ?? [];
      if (prefixes.length === 0) {
        return false;
      }

      return visibleErrorKeys.some((errorPath) =>
        prefixes.some(
          (prefix) =>
            errorPath === prefix || errorPath.startsWith(`${prefix}.`),
        ),
      );
    },
    [visibleErrorKeys],
  );

  const getStepForFieldPath = useCallback((fieldPath: string) => {
    const fieldPrefix = fieldPath.split(".")[0];

    for (const [stepId, prefixes] of Object.entries(STEP_ERROR_PREFIXES)) {
      if (
        prefixes.some(
          (prefix) => prefix === fieldPrefix || fieldPath.startsWith(prefix),
        )
      ) {
        return Number(stepId);
      }
    }

    return 1;
  }, []);

  const handleErrorClick = (fieldPath: string) => {
    const stepId = getStepForFieldPath(fieldPath);
    setCurrentStep(stepId);
    window.requestAnimationFrame(() => {
      scrollToField(fieldPath);
    });
  };

  const toggleReviewSection = useCallback((sectionId: string) => {
    setExpandedReviewSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  const scrollToField = useCallback((fieldPath: string) => {
    if (typeof document === "undefined") {
      return;
    }

    const exactTarget = document.querySelector(
      `[data-field-id="${fieldPath}"]`,
    ) as HTMLElement | null;
    const sectionTarget = document.querySelector(
      `[data-section-id="${fieldPath.split(".")[0]}"]`,
    ) as HTMLElement | null;
    const target = exactTarget ?? sectionTarget;

    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleMainLocationChange = useCallback(
    (locationData: {
      provincia: string;
      municipio: string;
      localidad: string;
    }) => {
      const nextLocation = [
        locationData.localidad || locationData.municipio,
        locationData.provincia,
      ]
        .filter(Boolean)
        .join(", ");

      updateFormData({ location: nextLocation }, "location");
    },
    [updateFormData],
  );

  useEffect(() => {
    const googleDataParam = searchParams.get("google_data");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      toast.error("Error al obtener datos de Google");
      return;
    }

    if (googleDataParam) {
      try {
        const decoded = JSON.parse(
          Buffer.from(googleDataParam, "base64").toString("utf-8"),
        );

        if (decoded.name) {
          const splitName = splitFullName(decoded.name);
          updateFormData({
            name: splitName.name,
            lastName: splitName.lastName,
            fullName: buildFullName(splitName.name, splitName.lastName),
          });
        }
        if (decoded.email) {
          updateFormData({ email: decoded.email });
        }
        if (decoded.picture) {
          updateFormData({ photo: decoded.picture });
          setPhotoPreview(decoded.picture);
        }

        toast.success("Datos de Google importados correctamente");
      } catch (e) {
        console.error("Error parsing Google data:", e);
        toast.error("Error al procesar datos de Google");
      }
    }
  }, [searchParams, updateFormData]);

  const availableTemplateColors = getTemplatePalette(formData.selectedTemplate);
  const certifications = formData.certifications ?? [];

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

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          id: generateId(),
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const updateExperience = (id: string, field: string, value: unknown) => {
    setFormData((prev) => {
      const nextExperience = prev.experience.map((exp) =>
        exp.id === id
          ? {
              ...exp,
              [field]: value,
              ...(field === "current" && value === true ? { endDate: "" } : {}),
            }
          : exp,
      );
      const nextState = { ...prev, experience: nextExperience };
      validateRealtime(nextState);
      return nextState;
    });

    const index = formData.experience.findIndex((exp) => exp.id === id);
    if (index >= 0) {
      setTouchedFields((prev) => ({
        ...prev,
        [`experience.${index}.${field}`]: true,
      }));
    }
  };

  const updateExperienceLocation = (
    id: string,
    locationData: { provincia: string; municipio: string; localidad: string },
  ) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, ...locationData } : exp,
      ),
    }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
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
    }));
  };

  const removeEducation = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const updateEducation = (id: string, field: string, value: unknown) => {
    setFormData((prev) => {
      const nextEducation = prev.education.map((edu) =>
        edu.id === id
          ? {
              ...edu,
              [field]: value,
              ...(field === "status" && value === "in_progress"
                ? { endDate: "" }
                : {}),
            }
          : edu,
      );
      const nextState = { ...prev, education: nextEducation };
      validateRealtime(nextState);
      return nextState;
    });

    const index = formData.education.findIndex((edu) => edu.id === id);
    if (index >= 0) {
      setTouchedFields((prev) => ({
        ...prev,
        [`education.${index}.${field}`]: true,
      }));
    }
  };

  const updateEducationLocation = (
    id: string,
    locationData: { provincia: string; municipio: string; localidad: string },
  ) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, ...locationData } : edu,
      ),
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skill.trim()],
      }));
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        { id: generateId(), language: "", level: "" },
      ],
    }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
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
    }));
  };

  const updateCertification = (
    id: string,
    field: keyof Certification,
    value: string,
  ) => {
    const index = (formData.certifications || []).findIndex(
      (item) => item.id === id,
    );
    updateFormData(
      {
        certifications: (formData.certifications || []).map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
                ...(field === "title" ? { name: value } : {}),
                ...(field === "institution" ? { issuer: value } : {}),
              }
            : item,
        ),
      },
      index >= 0 ? `certifications.${index}.${String(field)}` : undefined,
    );
  };

  const removeCertification = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter(
        (item) => item.id !== id,
      ),
    }));
  };

  const removeLanguage = (id: string) => {
    const nextLanguages = formData.languages.filter((lang) => lang.id !== id);
    setFormData((prev) => ({
      ...prev,
      languages: nextLanguages,
    }));
  };

  const updateLanguage = (id: string, field: keyof Language, value: string) => {
    const index = formData.languages.findIndex((item) => item.id === id);
    updateFormData(
      {
        languages: formData.languages.map((lang) =>
          lang.id === id ? { ...lang, [field]: value } : lang,
        ),
      },
      index >= 0 ? `languages.${index}.${String(field)}` : undefined,
    );
  };

  const handlePhotoUpload = (file: File) => {
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);
    setPhotoFile(file);
    toast.success("Foto seleccionada");
  };

  const handleDrop = (e: React.DragEvent, type: "photo") => {
    e.preventDefault();
    const file = type === "photo" ? e.dataTransfer.files[0] : null;
    if (file && file.type.startsWith("image/")) {
      handlePhotoUpload(file);
    }
  };

  const uploadPhotoToCloudinary = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const result = await uploadImage(formData);

    if (result.success && result.url) {
      return result.url;
    }
    throw new Error(result.error || "Error al subir la foto");
  };

  const onSubmit = async () => {
    setSubmitAttempted(true);
    const validation = validateCVPayload(formData);
    setFieldErrors(validation.success ? {} : validation.errors);

    if (!validation.success) {
      handleErrorClick(Object.keys(validation.errors)[0] ?? "");
      toast.error("Revisá los campos marcados en rojo");
      return;
    }

    setIsSubmitting(true);
    try {
      let photoUrl = "";

      if (photoFile) {
        photoUrl = await uploadPhotoToCloudinary(photoFile);
      }

      await createCV({
        ...formData,
        fullName: buildFullName(formData.name, formData.lastName),
        templateSettings: buildTemplateSettingsDefaults(
          formData.templateSettings.primaryColor || "#1e3a5f",
        ),
        photo: photoUrl,
        email: formData.email || "",
      });
      window.location.href = `/success?phone=${encodeURIComponent(formData.phone)}&name=${encodeURIComponent(buildFullName(formData.name, formData.lastName))}`;
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el formulario");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return (
          !fieldErrors.name &&
          !fieldErrors.lastName &&
          !fieldErrors.phone &&
          !!formData.name &&
          !!formData.lastName &&
          !!formData.phone
        );
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8 text-center"
        >
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Crea tu CV</h1>
          <p className="text-sm md:text-base text-muted-foreground px-2">
            Completa los siguientes pasos
          </p>
        </motion.div>

        {submitAttempted && Object.keys(fieldErrors).length > 0 ? (
          <div className="mb-6">
            <ErrorSummary errors={fieldErrors} onErrorClick={handleErrorClick} />
          </div>
        ) : null}

        <div className="hidden md:flex justify-center mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
            {registroSteps.map((step, index) => {
              const hasStepError = stepHasVisibleError(step.id);

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() =>
                      step.id < currentStep && setCurrentStep(step.id)
                    }
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

        <Card>
          <CardContent className="pt-6">
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
                      {/* <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => {
                          window.location.href = "/api/auth/google";
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="currentColor"
                        >
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Llenar con Google
                      </Button> */}

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nombre *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              updateFormData({ name: e.target.value }, "name")
                            }
                            placeholder="Juan"
                            className={cn(
                              getFieldError("name") &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                          {getFieldError("name") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError("name")}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="lastName">Apellido *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) =>
                              updateFormData(
                                { lastName: e.target.value },
                                "lastName",
                              )
                            }
                            placeholder="Pérez"
                            className={cn(
                              getFieldError("lastName") &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                          {getFieldError("lastName") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError("lastName")}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Teléfono *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              updateFormData({ phone: e.target.value }, "phone")
                            }
                            placeholder="5491112345678"
                            className={cn(
                              getFieldError("phone") &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                          {getFieldError("phone") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError("phone")}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="dni">DNI (opcional)</Label>
                          <Input
                            id="dni"
                            value={formData.dni}
                            onChange={(e) =>
                              updateFormData({ dni: e.target.value }, "dni")
                            }
                            placeholder="12.345.678"
                            className={cn(
                              getFieldError("dni") &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                          {getFieldError("dni") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError("dni")}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="fechaNacimiento">
                            Fecha de nacimiento (opcional)
                          </Label>
                          <Input
                            id="fechaNacimiento"
                            type="date"
                            value={formData.fechaNacimiento || ""}
                            onChange={(e) =>
                              updateFormData(
                                { fechaNacimiento: e.target.value },
                                "fechaNacimiento",
                              )
                            }
                            max={new Date().toISOString().split("T")[0]}
                            className={cn(
                              getFieldError("fechaNacimiento") &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                          {getFieldError("fechaNacimiento") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError("fechaNacimiento")}
                            </p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="email">Email (opcional)</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              updateFormData({ email: e.target.value }, "email")
                            }
                            placeholder="juan@email.com"
                            className={cn(
                              getFieldError("email") &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                          {getFieldError("email") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError("email")}
                            </p>
                          )}
                        </div>
                      </div>

                      {!showLocation ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLocation(true)}
                          className="w-full"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Agregar ubicación
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          {(() => {
                            const parts = (formData.location || "")
                              .split(", ")
                              .map((item) => item.trim())
                              .filter(Boolean);

                            const parsedValue =
                              parts.length >= 3
                                ? {
                                    localidad: parts[0] || "",
                                    municipio: parts[1] || "",
                                    provincia: parts[2] || "",
                                  }
                                : {
                                    localidad: "",
                                    municipio: parts[0] || "",
                                    provincia: parts[1] || "",
                                  };

                            return (
                              <LocationSelector
                                value={parsedValue}
                                onChange={handleMainLocationChange}
                                showLabels={false}
                              />
                            );
                          })()}
                          <p className="text-xs text-muted-foreground">
                            Selecciona provincia y municipio/localidad.
                          </p>
                        </div>
                      )}

                      {!showLinks ? (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLinks(true)}
                          className="w-full"
                        >
                          <Link2 className="h-4 w-4 mr-2" />
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
                            className={cn(
                              getFieldError("links") &&
                                "border-red-500 focus-visible:ring-red-500",
                            )}
                          />
                          {getFieldError("links") && (
                            <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError("links")}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Separa varios links con comas
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <SiLinkerd className="h-3.5 w-3.5" />
                              LinkedIn
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <SiGithub className="h-3.5 w-3.5" />
                              GitHub
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => setShowLinks(false)}
                          >
                            Listo
                          </Button>
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
                  className="space-y-4"
                >
                  <Card data-section-id="photo">
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <CardTitle>Foto de perfil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="flex flex-col items-center justify-center py-8 border-2 border-dashed rounded-lg"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, "photo")}
                      >
                        {photoPreview ? (
                          <div className="relative">
                            <Image
                              src={photoPreview}
                              alt="Foto de perfil"
                              width={128}
                              height={128}
                              unoptimized
                              className="w-32 h-32 rounded-full object-cover border-4 border-foreground"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPhotoPreview(null);
                                setPhotoFile(null);
                              }}
                              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-dashed border-muted-foreground">
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <Label htmlFor="photo" className="mt-4 cursor-pointer">
                          <div className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity">
                            <Upload className="h-4 w-4" />
                            {uploadingPhoto
                              ? "Subiendo..."
                              : "Seleccionar foto"}
                          </div>
                          <input
                            id="photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handlePhotoUpload(e.target.files?.[0]!)
                            }
                            disabled={uploadingPhoto}
                          />
                        </Label>
                        <p className="text-sm text-muted-foreground mt-2">
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
                      <CardTitle>Experiencia laboral</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.experience.map((exp, index) => (
                        <div
                          key={exp.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">
                              Experiencia {index + 1}
                            </h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeExperience(exp.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Empresa"
                              value={exp.company}
                              onChange={(e) =>
                                updateExperience(
                                  exp.id,
                                  "company",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                getFieldError(`experience.${index}.company`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                            <Input
                              placeholder="Puesto"
                              value={exp.position}
                              onChange={(e) =>
                                updateExperience(
                                  exp.id,
                                  "position",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                getFieldError(`experience.${index}.position`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                            {getFieldError(`experience.${index}.company`) && (
                              <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                {getFieldError(`experience.${index}.company`)}
                              </p>
                            )}
                            {getFieldError(`experience.${index}.position`) && (
                              <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                {getFieldError(`experience.${index}.position`)}
                              </p>
                            )}
                            <ExperienceLocationSelector
                              experienciaId={exp.id}
                              initialProvincia={exp.provincia}
                              initialMunicipio={exp.municipio}
                              initialLocalidad={exp.localidad}
                              onChange={updateExperienceLocation}
                            />
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
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
                              className={cn(
                                getFieldError(
                                  `experience.${index}.startDate`,
                                ) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
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
                              className={cn(
                                getFieldError(`experience.${index}.endDate`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                          </div>
                          {getFieldError(`experience.${index}.startDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError(`experience.${index}.startDate`)}
                            </p>
                          )}
                          {getFieldError(`experience.${index}.endDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError(`experience.${index}.endDate`)}
                            </p>
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
                              className="rounded"
                            />
                            <span className="text-sm">Trabajo actual</span>
                          </label>
                          <Textarea
                            placeholder="¿Qué funciones realizabas? ¿Qué logros obtuviste?"
                            value={exp.description}
                            onChange={(e) =>
                              updateExperience(
                                exp.id,
                                "description",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addExperience}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar experiencia
                      </Button>
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.education.map((edu, index) => (
                        <div
                          key={edu.id}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">
                              Educación {index + 1}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              type="button"
                              onClick={() => removeEducation(edu.id)}
                              className="text-destructive hover:text-destructive/80"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Institución"
                              value={edu.institution}
                              onChange={(e) =>
                                updateEducation(
                                  edu.id,
                                  "institution",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                getFieldError(
                                  `education.${index}.institution`,
                                ) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                            <Input
                              placeholder="Título"
                              value={edu.degree}
                              onChange={(e) =>
                                updateEducation(
                                  edu.id,
                                  "degree",
                                  e.target.value,
                                )
                              }
                              className={cn(
                                getFieldError(`education.${index}.degree`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                          </div>
                          {getFieldError(`education.${index}.institution`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError(`education.${index}.institution`)}
                            </p>
                          )}
                          {getFieldError(`education.${index}.degree`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError(`education.${index}.degree`)}
                            </p>
                          )}
                          <EducationLocationSelector
                            educacionId={edu.id}
                            initialProvincia={edu.provincia}
                            initialMunicipio={edu.municipio}
                            initialLocalidad={edu.localidad}
                            onChange={updateEducationLocation}
                          />
                          <div className="grid md:grid-cols-2 gap-3">
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
                              className={cn(
                                getFieldError(`education.${index}.startDate`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
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
                              className={cn(
                                getFieldError(`education.${index}.endDate`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                          </div>
                          {getFieldError(`education.${index}.startDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError(`education.${index}.startDate`)}
                            </p>
                          )}
                          {getFieldError(`education.${index}.endDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                              {getFieldError(`education.${index}.endDate`)}
                            </p>
                          )}
                          <div>
                            <Label>Estado del estudio *</Label>
                            <Select
                              value={edu.status}
                              onChange={(e) =>
                                updateEducation(
                                  edu.id,
                                  "status",
                                  e.target.value,
                                )
                              }
                              options={EDUCATION_STATUS_OPTIONS}
                              className={cn(
                                getFieldError(`education.${index}.status`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                            {getFieldError(`education.${index}.status`) && (
                              <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                {getFieldError(`education.${index}.status`)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addEducation}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar educación
                      </Button>
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
                        onClick={addCertification}
                        className="ml-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {certifications.length > 0 ? (
                        <div className="space-y-3">
                          {certifications.map((course, index) => (
                            <div
                              key={course.id}
                              className="rounded-md border bg-background p-3 space-y-3"
                            >
                              <div className="flex justify-between items-center">
                                 <h4 className="font-medium">
                              curso {index + 1}
                            </h4>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive/80"
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
                                        updateCertification(
                                          course.id,
                                          "title",
                                          e.target.value,
                                        )
                                      }
                                      className={cn(
                                        getFieldError(
                                          `certifications.${index}.title`,
                                        ) &&
                                          "border-red-500 focus-visible:ring-red-500",
                                      )}
                                    />
                                    {getFieldError(
                                      `certifications.${index}.title`,
                                    ) && (
                                      <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                        {getFieldError(
                                          `certifications.${index}.title`,
                                        )}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <Label>Institución</Label>
                                    <Input
                                      data-field-id={`certifications.${index}.institution`}
                                      value={course.institution ?? ""}
                                      onChange={(e) =>
                                        updateCertification(
                                          course.id,
                                          "institution",
                                          e.target.value,
                                        )
                                      }
                                      className={cn(
                                        getFieldError(
                                          `certifications.${index}.institution`,
                                        ) &&
                                          "border-red-500 focus-visible:ring-red-500",
                                      )}
                                    />
                                    {getFieldError(
                                      `certifications.${index}.institution`,
                                    ) && (
                                      <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                        {getFieldError(
                                          `certifications.${index}.institution`,
                                        )}
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
                                        updateCertification(
                                          course.id,
                                          "startMonth",
                                          e.target.value,
                                        )
                                      }
                                      options={monthSelectOptions}
                                      placeholder="Seleccionar mes"
                                      className={cn(
                                        getFieldError(
                                          `certifications.${index}.startMonth`,
                                        ) &&
                                          "border-red-500 focus-visible:ring-red-500",
                                      )}
                                    />
                                    {getFieldError(
                                      `certifications.${index}.startMonth`,
                                    ) && (
                                      <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                        {getFieldError(
                                          `certifications.${index}.startMonth`,
                                        )}
                                      </p>
                                    )}
                                  </div>
                                  <div>
                                    <Label>Año de inicio</Label>
                                    <Select
                                      data-field-id={`certifications.${index}.startYear`}
                                      value={course.startYear ?? ""}
                                      onChange={(e) =>
                                        updateCertification(
                                          course.id,
                                          "startYear",
                                          e.target.value,
                                        )
                                      }
                                      options={yearSelectOptions}
                                      placeholder="Seleccionar año"
                                      className={cn(
                                        getFieldError(
                                          `certifications.${index}.startYear`,
                                        ) &&
                                          "border-red-500 focus-visible:ring-red-500",
                                      )}
                                    />
                                    {getFieldError(
                                      `certifications.${index}.startYear`,
                                    ) && (
                                      <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                                        {getFieldError(
                                          `certifications.${index}.startYear`,
                                        )}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Aún no agregaste cursos ni certificaciones.
                        </p>
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
                      <div className="flex gap-2">
                        <Input
                          placeholder="Escribe una habilidad"
                          id="newSkill"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = document.getElementById(
                                "newSkill",
                              ) as HTMLInputElement;
                              addSkill(input.value);
                              input.value = "";
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const input = document.getElementById(
                              "newSkill",
                            ) as HTMLInputElement;
                            addSkill(input.value);
                            input.value = "";
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formData.skills.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Ej: Atención al cliente, Ventas, Manipulación de
                          alimentos
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <CardTitle>Idiomas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLanguage}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar idioma
                      </Button>
                      <div className="space-y-3">
                        {formData.languages.map((lang, index) => (
                          <div
                            key={lang.id}
                            className="flex flex-col sm:flex-row gap-2 rounded-md border bg-background p-3"
                          >
                            <Select
                              data-field-id={`languages.${index}.language`}
                              value={lang.language}
                              placeholder="Idioma"
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
                                getFieldError(`languages.${index}.language`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                            <Select
                              data-field-id={`languages.${index}.level`}
                              value={lang.level}
                              placeholder="Nivel"
                              onChange={(e) =>
                                updateLanguage(lang.id, "level", e.target.value)
                              }
                              options={levelSelectOptions}
                              className={cn(
                                "sm:w-32",
                                getFieldError(`languages.${index}.level`) &&
                                  "border-red-500 focus-visible:ring-red-500",
                              )}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeLanguage(lang.id)}
                              className="self-end sm:self-auto text-destructive hover:text-destructive/80"
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
                        <p className="text-xs text-muted-foreground">
                          Aún no agregaste idiomas.
                        </p>
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
                            className="rounded"
                          />
                          <BadgeCheck className="h-4 w-4 text-primary" />
                          <span className="text-sm">Licencia</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!formData.movilidad}
                            onChange={(e) =>
                              updateFormData(
                                { movilidad: e.target.checked },
                                "movilidad",
                              )
                            }
                            className="rounded"
                          />
                          <CarFront className="h-4 w-4 text-primary" />
                          <span className="text-sm">Movilidad propia</span>
                        </label>
                        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!formData.incorporacionInmediata}
                            onChange={(e) =>
                              updateFormData(
                                { incorporacionInmediata: e.target.checked },
                                "incorporacionInmediata",
                              )
                            }
                            className="rounded"
                          />
                          <Zap className="h-4 w-4 text-primary" />
                          <span className="text-sm">
                            Incorporación inmediata
                          </span>
                        </label>
                        <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                          <input
                            type="checkbox"
                            checked={!!formData.office}
                            onChange={(e) =>
                              updateFormData(
                                { office: e.target.checked },
                                "office",
                              )
                            }
                            className="rounded"
                          />
                          <SiLibreofficewriter className="h-4 w-4" />
                          <span className="text-sm">Microsoft Office</span>
                        </label>
                      </div>
                      {formData.licencia && (
                        <div>
                          <Label>Tipo de licencia</Label>
                          <Input
                            placeholder="Ej: B1, profesional, etc."
                            value={formData.licencia}
                            onChange={(e) =>
                              updateFormData(
                                { licencia: e.target.value },
                                "licencia",
                              )
                            }
                          />
                        </div>
                      )}
                      <div>
                        <Label>Disponibilidad horaria</Label>
                        <Select
                          value={formData.disponibilidad || ""}
                          placeholder="Seleccionar disponibilidad"
                          onChange={(e) =>
                            updateFormData(
                              {
                                disponibilidad: e.target.value as
                                  | "fullTime"
                                  | "partTime",
                              },
                              "disponibilidad",
                            )
                          }
                          options={availabilityOptions}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle>Resumen breve</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Descripción del perfil</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSummaryModal(true)}
                        >
                          <AlertCircle className="h-4 w-4 mr-1" />
                          ¿Qué escribir?
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Breve descripción de tu perfil profesional..."
                        value={formData.summary}
                        onChange={(e) =>
                          updateFormData({ summary: e.target.value }, "summary")
                        }
                        className={cn(
                          "h-20",
                          getFieldError("summary") &&
                            "border-red-500 focus-visible:ring-red-500",
                        )}
                      />
                      {getFieldError("summary") && (
                        <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                          {getFieldError("summary")}
                        </p>
                      )}
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
                        <Label>Elige el diseño de tu CV</Label>
                        <div className="mt-4">
                          <TemplateCarousel
                            templates={templateOptions}
                            selectedTemplate={formData.selectedTemplate}
                            onSelectTemplate={handleTemplateSelection}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Color del diseño</Label>
                        <div className="flex flex-wrap gap-3 mt-2">
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
                                "h-10 w-10 rounded-full border-2 transition-all cursor-pointer",
                                formData.templateSettings.primaryColor === color
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
                  className="space-y-6"
                >
                  <Card>
                    <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <CardTitle>Confirmar datos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border-t pt-4">
                        <h3 className="font-medium mb-4">
                          Resumen de tus datos
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Nombre:
                            </span>
                            <span>
                              {buildFullName(
                                formData.name,
                                formData.lastName,
                              ) || "No especificado"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Teléfono:
                            </span>
                            <span>{formData.phone}</span>
                          </div>
                          {formData.email && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Email:
                              </span>
                              <span>{formData.email}</span>
                            </div>
                          )}
                          {formData.location && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">
                                Ubicación:
                              </span>
                              <span>{formData.location}</span>
                            </div>
                          )}
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
                          {(photoPreview || formData.photo) && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-muted-foreground">
                                Foto:
                              </span>
                              <Image
                                src={photoPreview || formData.photo || ""}
                                alt="Foto"
                                width={40}
                                height={40}
                                unoptimized
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <Alert className="mt-4 bg-yellow-50 border-yellow-200">

                        <AlertDescription className="text-black text-sm flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-black" />
                          <span>

                          Verifica que todos los datos estén correctos antes de
                          enviar el formulario.
                          </span>
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              {currentStep < registroSteps.length ? (
                <Button
                  onClick={() =>
                    setCurrentStep((prev) =>
                      Math.min(registroSteps.length, prev + 1),
                    )
                  }
                  disabled={!canProceed()}
                  className="w-full sm:w-auto"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={onSubmit}
                  loading={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showSummaryModal && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card p-6 rounded-lg max-w-md">
            <h3 className="font-bold mb-2">¿Qué escribir en el resumen?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              El resumen es una descripción breve (2-3 oraciones) de quién eres
              y qué aportas. Ejemplo: &quot;Profesional con experiencia en
              atención al cliente, orientado a la satisfacción del usuario y
              resolución de problemas. Busco desarrollarme en el sector de
              ventas y servicio al cliente.&quot;
            </p>
            <Button
              onClick={() => setShowSummaryModal(false)}
              className="w-full"
            >
              Entendido
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <RegistroPageContent />
    </Suspense>
  );
}

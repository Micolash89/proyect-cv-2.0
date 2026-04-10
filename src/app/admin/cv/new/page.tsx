"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AITextExtractor, type ExtractedCVData } from "@/components/ui/ai-text-extractor";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  FileText,
  CheckCircle,
  ArrowRight,
  Upload,
  Send,
} from "lucide-react";
import { cn, generateId } from "@/lib/utils/cn";
import { createCV } from "@/app/actions/cv";
import { uploadImage } from "@/app/actions/upload";
import {
  languageOptions,
  levelOptions,
  fontSizeOptions,
  layoutOptions,
  registroSteps,
} from "@/lib/constants";
import {
  getTemplateDefaultColor,
  getTemplatePalette,
  sanitizeTemplatePrimaryColor,
  templateOptions,
} from "@/lib/constants/templates";
import { getProvincias, getDepartamentos, getMunicipiosLocalidad, type Provincia, type Departamento, type Localidad } from "@/lib/api/georef";
import { ExperienceLocationSelector } from "@/components/admin/cv/ExperienceLocationSelector";
import { EducationLocationSelector } from "@/components/admin/cv/EducationLocationSelector";
import type { TemplateType, Experience, Education, Language, TemplateSettings, FontSize } from "@/types";
import { TemplateCarousel } from "@/components/ui/template-carousel";
import { buildFullName, splitFullName, validateCVPayload } from "@/lib/validations";

const DEFAULT_TEMPLATE_SETTINGS: Partial<TemplateSettings> = {
  primaryColor: getTemplateDefaultColor("harvard"),
  fontSize: "medium",
  fontFamily: "Helvetica",
  layout: "descending",
  padding: 40,
  margin: 20,
  fullName: true,
  showPhoto: true,
  showSummary: true,
  showSkills: true,
  showLanguages: true,
  reverseExperience: false,
  reverseEducation: false,
};

export default function AdminNewCVPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    fullName: "",
    phone: "",
    dni: "",
    email: "",
    location: "",
    links: "",
    summary: "",
    photo: "",
    experience: [] as Experience[],
    education: [] as Education[],
    skills: [] as string[],
    languages: [] as Language[],
    selectedTemplate: "harvard" as TemplateType,
    templateSettings: DEFAULT_TEMPLATE_SETTINGS,
    targetJob: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [localidades, setMunicipiosLocalidad] = useState<Localidad[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState<string>("");
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>("");
  const [selectedLocalidad, setSelectedLocalidad] = useState<string>("");

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
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 1MB");
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
          startDate: "",
          endDate: "",
          current: false,
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
              ...(field === "current" && value === true ? { endDate: "" } : {}),
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
        { id: generateId(), language: "Español", level: "Intermedio" },
      ],
    });
  };

  const removeLanguage = (id: string) => {
    updateFormData({
      languages: formData.languages.filter((l) => l.id !== id),
    });
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    updateFormData({
      languages: formData.languages.map((l) =>
        l.id === id ? { ...l, [field]: value } : l,
      ),
    });
  };

  const handleDataExtracted = (data: ExtractedCVData) => {
    const splitName = splitFullName(data.fullName || "");

    setFormData((prev) => ({
      ...prev,
      name: splitName.name || prev.name,
      lastName: splitName.lastName || prev.lastName,
      fullName: buildFullName(splitName.name || prev.name, splitName.lastName || prev.lastName),
      phone: data.phone || prev.phone,
      email: data.email || prev.email,
      location: data.location || prev.location,
      summary: data.summary || prev.summary,
      experience:
        data.experience.length > 0 ? data.experience : prev.experience,
      education: data.education.length > 0 ? data.education : prev.education,
      skills: data.skills.length > 0 ? data.skills : prev.skills,
      languages: data.languages.length > 0 ? data.languages : prev.languages,
    }));
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);
    const isValid = validateRealtime(formData);
    if (!isValid) {
      toast.error("Revisá los campos marcados en rojo");
      return;
    }

    setLoading(true);
    try {
      const finalTemplateSettings = {
        primaryColor: formData.templateSettings.primaryColor || "#1e3a5f",
        fontSize: formData.templateSettings.fontSize || "medium",
        fontFamily: formData.templateSettings.fontFamily || "Helvetica",
        layout: formData.templateSettings.layout || "descending",
        padding: formData.templateSettings.padding || 40,
        margin: formData.templateSettings.margin || 20,
        fullName: formData.templateSettings.fullName !== false,
        showPhoto: formData.templateSettings.showPhoto !== false,
        showSummary: formData.templateSettings.showSummary !== false,
        showSkills: formData.templateSettings.showSkills !== false,
        showLanguages: formData.templateSettings.showLanguages !== false,
        reverseExperience: formData.templateSettings.reverseExperience || false,
        reverseEducation: formData.templateSettings.reverseEducation || false,
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

  useEffect(() => {
    const loadProvincias = async () => {
      try {
        const data = await getProvincias();
        setProvincias(data);
      } catch (error) {
        console.error("Error loading provincias:", error);
      }
    };
    loadProvincias();
  }, []);

  useEffect(() => {
    const loadDepartamentos = async () => {
      if (!selectedProvincia) {
        setDepartamentos([]);
        setMunicipiosLocalidad([]);
        setSelectedDepartamento("");
        setSelectedLocalidad("");
        return;
      }
      try {
        const data = await getDepartamentos(selectedProvincia);
        setDepartamentos(data);
        setMunicipiosLocalidad([]);
        setSelectedDepartamento("");
        setSelectedLocalidad("");
      } catch (error) {
        console.error("Error loading departamentos:", error);
      }
    };
    loadDepartamentos();
  }, [selectedProvincia]);

  useEffect(() => {
    const loadMunicipiosLocalidad = async () => {
      if (!selectedProvincia) {
        setMunicipiosLocalidad([]);
        return;
      }
      try {
        const data = await getMunicipiosLocalidad(selectedProvincia, selectedDepartamento || undefined);
        setMunicipiosLocalidad(data);
        setSelectedLocalidad("");
      } catch (error) {
        console.error("Error loading localidades:", error);
      }
    };
    loadMunicipiosLocalidad();
  }, [selectedProvincia, selectedDepartamento]);

  const updateLocation = () => {
    const provinciaNombre = selectedProvincia ? provincias.find(p => p.id === selectedProvincia)?.nombre : "";
    const parts = [
      selectedLocalidad || selectedDepartamento,
      provinciaNombre
    ].filter(Boolean);
    updateFormData({ location: parts.join(", ") });
  };

  useEffect(() => {
    updateLocation();
  }, [selectedProvincia, selectedDepartamento, selectedLocalidad]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/admin")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver al panel
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Nuevo CV</h1>
            <p className="text-muted-foreground">Crear un nuevo currículum</p>
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto">
          {registroSteps.map((step) => (
            <button
              type="button"
              key={step.id}
              onClick={() => step.id < currentStep && setCurrentStep(step.id)}
              disabled={step.id > currentStep}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm",
                currentStep === step.id && "bg-primary text-primary-foreground",
                currentStep > step.id && "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200",
                currentStep < step.id && "bg-muted text-muted-foreground cursor-not-allowed",
              )}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
              {step.title}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Datos Personales</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-2 gap-4">
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
                      <div className="grid grid-cols-2 gap-4">
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
                          <Label>Ubicación</Label>
                          <div className="space-y-2 mt-2">
                          <select
                            value={selectedProvincia}
                            onChange={(e) => setSelectedProvincia(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Seleccioná una provincia</option>
                            {provincias.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.nombre}
                              </option>
                            ))}
                          </select>
                          
                          {departamentos.length > 0 && (
                            <select
                              value={selectedDepartamento}
                              onChange={(e) => setSelectedDepartamento(e.target.value)}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="">Seleccioná un departamento</option>
                              {departamentos.map((d) => (
                                <option key={d.id} value={d.nombre}>
                                  {d.nombre}
                                </option>
                              ))}
                            </select>
                          )}
                          
                          <select
                            value={selectedLocalidad}
                            onChange={(e) => setSelectedLocalidad(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Seleccioná una localidad</option>
                            {localidades.map((l) => (
                              <option key={l.id} value={l.nombre}>
                                {l.nombre}
                              </option>
                            ))}
                          </select>
                          
                          {formData.location && (
                            <p className="text-sm text-muted-foreground">
                              {formData.location}
                            </p>
                          )}
                        </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Label>Links relevantes (opcional)</Label>
                        <Textarea
                          value={formData.links}
                          onChange={(e) =>
                            updateFormData({ links: e.target.value }, "links")
                          }
                          placeholder="linkedin.com/in/tu-perfil, github.com/tu-usuario"
                          rows={2}
                          className={cn(getFieldError("links") && "border-red-500 focus-visible:ring-red-500")}
                        />
                        {getFieldError("links") && (
                          <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("links")}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Separa varios links con comas
                        </p>
                      </div>
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
                  <Card>
                    <CardHeader>
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
                            <img
                              src={photoPreview || formData.photo}
                              alt="Foto"
                              className="w-full h-full object-cover"
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
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Experiencia Laboral</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addExperience}
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
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Educación</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addEducation}
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
                              disabled={edu.current}
                              className={cn(getFieldError(`education.${index}.endDate`) && "border-red-500 focus-visible:ring-red-500")}
                            />
                          </div>
                          {getFieldError(`education.${index}.startDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.startDate`)}</p>
                          )}
                          {getFieldError(`education.${index}.endDate`) && (
                            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.endDate`)}</p>
                          )}
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={edu.current}
                              onChange={(e) =>
                                updateEducation(
                                  edu.id,
                                  "current",
                                  e.target.checked,
                                )
                              }
                            />
                            <span className="text-sm">Estudio actual</span>
                          </label>
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
                  className="space-y-4"
                >
                  <Card>
                    <CardHeader>
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
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Idiomas</CardTitle>
                      <Button variant="outline" size="sm" onClick={addLanguage}>
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {formData.languages.map((lang) => (
                        <div key={lang.id} className="flex gap-2 items-center">
                          <Select
                            value={lang.language}
                            onChange={(e) =>
                              updateLanguage(
                                lang.id,
                                "language",
                                e.target.value,
                              )
                            }
                            options={
                              languageOptions as unknown as {
                                value: string;
                                label: string;
                              }[]
                            }
                          />
                          <Select
                            value={lang.level}
                            onChange={(e) =>
                              updateLanguage(lang.id, "level", e.target.value)
                            }
                            options={
                              levelOptions as unknown as {
                                value: string;
                                label: string;
                              }[]
                            }
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLanguage(lang.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
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
                    <CardHeader>
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

                      <div className="border-t pt-4">
                        <Label className="text-base font-semibold">Configuración Avanzada</Label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">Tamaño de fuente</Label>
                          <Select
                            value={formData.templateSettings.fontSize || "medium"}
                            onChange={(e) =>
                              updateFormData({
                                templateSettings: {
                                  ...formData.templateSettings,
                                  fontSize: e.target.value as FontSize,
                                },
                              })
                            }
                            options={[
                              { value: "small", label: "Pequeño" },
                              { value: "medium", label: "Mediano" },
                              { value: "large", label: "Grande" },
                            ]}
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Padding</Label>
                          <Select
                            value={String(formData.templateSettings.padding || 40)}
                            onChange={(e) =>
                              updateFormData({
                                templateSettings: {
                                  ...formData.templateSettings,
                                  padding: parseInt(e.target.value),
                                },
                              })
                            }
                            options={[
                              { value: "30", label: "Compact (30px)" },
                              { value: "40", label: "Normal (40px)" },
                              { value: "50", label: "Espacioso (50px)" },
                            ]}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.templateSettings.fullName !== false}
                            onChange={(e) =>
                              updateFormData({
                                templateSettings: {
                                  ...formData.templateSettings,
                                  fullName: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4"
                          />
                          Mostrar nombre completo
                        </Label>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.templateSettings.showPhoto !== false}
                            onChange={(e) =>
                              updateFormData({
                                templateSettings: {
                                  ...formData.templateSettings,
                                  showPhoto: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4"
                          />
                          Mostrar foto
                        </Label>
                        <Label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.templateSettings.showSummary !== false}
                            onChange={(e) =>
                              updateFormData({
                                templateSettings: {
                                  ...formData.templateSettings,
                                  showSummary: e.target.checked,
                                },
                              })
                            }
                            className="w-4 h-4"
                          />
                          Mostrar resumen
                        </Label>
                      </div>
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
                >
                  <Card>
                    <CardHeader>
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

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Importar CV</CardTitle>
              </CardHeader>
              <CardContent>
                <AITextExtractor onDataExtracted={handleDataExtracted} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

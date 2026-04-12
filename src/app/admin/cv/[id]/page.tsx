"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorSummary } from "@/components/admin/cv/ErrorSummary";
import { AdminCVPageSkeleton } from "@/components/admin/cv/AdminCVPageSkeleton";
import {
  ArrowLeft,
  Save,
  Download,
  Trash2,
  Plus,
  X,
  Sparkles,
  Eye,
  CheckCircle,
  // Clock,
  Upload,
  // FileText,
  Loader2,
  Wand2,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { generateId, cn } from "@/lib/utils/cn";
import type {
  FontSize,
  LayoutOrder,
  CVStatus,
  UserCV,
  Experience,
  Certification,
  // Education,
  // Language,
} from "@/types";
import { EducationLocationSelector } from "@/components/admin/cv/EducationLocationSelector";
import { ExperienceLocationSelector } from "@/components/admin/cv/ExperienceLocationSelector";
import { LocationSelector } from "@/components/admin/cv/LocationSelector";
import {
  getProvincias,
  getDepartamentos,
  type Provincia,
  type Departamento,
} from "@/lib/api/georef";
import { getCV, updateCV } from "@/app/actions/cv";
import { uploadImage } from "@/app/actions/upload";
import {
  // extractCVAction,
  improveTextAction,
  generateProfileAction,
} from "@/app/actions/ia";
import { generateSkills } from "@/lib/ia/factory";
import {
  getTemplateDefaultColor,
  getTemplatePalette,
  sanitizeTemplatePrimaryColor,
  templateOptions,
} from "@/lib/constants/templates";
import {
  availabilityOptions,
  layoutOptions,
  monthSelectOptions,
  yearSelectOptions,
} from "@/lib/constants";
import { TemplateCarousel } from "@/components/ui/template-carousel";
import { buildFullName, splitFullName, validateCVPayload } from "@/lib/validations";
import { validateImageFile } from "@/lib/validations/files";
import { buildTemplateSettingsDefaults } from "@/lib/constants/cv";

const VISIBILITY_SETTINGS: Array<{
  key:
    | "showPhoto"
    | "showSummary"
    | "showSkills"
    | "showLanguages"
    | "showCertifications"
    | "showOrientation";
  label: string;
}> = [
  { key: "showPhoto", label: "Foto" },
  { key: "showSummary", label: "Resumen" },
  { key: "showSkills", label: "Habilidades" },
  { key: "showLanguages", label: "Idiomas" },
  { key: "showCertifications", label: "Certificaciones" },
  { key: "showOrientation", label: "Orientación profesional" },
];

export default function AdminCVPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserCV | null>(null);
  const [originalUser, setOriginalUser] = useState<UserCV | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingProfile, setGeneratingProfile] = useState(false);
  const [improvingText, setImprovingText] = useState<string | null>(null);
  // const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [nameFields, setNameFields] = useState({ name: "", lastName: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [showLicenseInput, setShowLicenseInput] = useState(false);
  const [newCertification, setNewCertification] = useState({
    title: "",
    institution: "",
    startMonth: "",
    startYear: "",
  });
  const [editingCertificationId, setEditingCertificationId] = useState<string | null>(null);
  const [editingCertificationSnapshot, setEditingCertificationSnapshot] = useState<Certification | null>(null);

  // Location state for Datos Personales
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [selectedProvincia, setSelectedProvincia] = useState("");
  const [selectedDepartamento, setSelectedDepartamento] = useState("");
  const [selectedLocalidad, setSelectedLocalidad] = useState("");

  const normalizeTemplateSettings = useCallback(
    (
      template: UserCV["selectedTemplate"],
      settings?: Partial<UserCV["templateSettings"]>,
    ): UserCV["templateSettings"] => {
      const defaultColor = getTemplateDefaultColor(template);
      const merged = {
        ...buildTemplateSettingsDefaults(defaultColor),
        ...settings,
      };
      const primaryColor = sanitizeTemplatePrimaryColor(
        template,
        merged.primaryColor || defaultColor,
      );

      return {
        ...merged,
        primaryColor,
        headerBackground: primaryColor,
      };
    },
    [],
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - previewPosition.x,
      y: e.clientY - previewPosition.y,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      setPreviewPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  }, [dragOffset.x, dragOffset.y, isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, isDragging]);

  const fetchUser = useCallback(async () => {
    if (!params.id) return;
    try {
      const { user: fetchedUser } = await getCV(params.id as string);
      const hydratedUser = {
        ...fetchedUser,
        templateSettings: normalizeTemplateSettings(
          fetchedUser.selectedTemplate,
          fetchedUser.templateSettings,
        ),
      };

      setUser(hydratedUser);
      setNameFields(splitFullName(hydratedUser.fullName));
      setOriginalUser(JSON.parse(JSON.stringify(hydratedUser)));
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }, [normalizeTemplateSettings, params.id, router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const validateRealtime = useCallback((candidate: UserCV, names = nameFields) => {
    const validation = validateCVPayload({
      ...candidate,
      name: names.name,
      lastName: names.lastName,
    });
    setFieldErrors(validation.success ? {} : validation.errors);

    return validation.success;
  }, [nameFields]);

  const getFieldError = useCallback((path: string) => {
    if (!submitAttempted && !touchedFields[path]) {
      return "";
    }

    return fieldErrors[path] ?? "";
  }, [fieldErrors, submitAttempted, touchedFields]);

  const scrollToField = useCallback((fieldPath: string) => {
    if (typeof document === "undefined") {
      return;
    }

    const exactTarget = document.querySelector(`[data-field-id="${fieldPath}"]`) as HTMLElement | null;
    const sectionTarget = document.querySelector(`[data-section-id="${fieldPath.split(".")[0]}"]`) as HTMLElement | null;
    const target = exactTarget ?? sectionTarget;

    target?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const handleStatusChange = useCallback(async (status: CVStatus) => {
    if (!user) return;
    setSaving(true);
    try {
      await updateCV(user._id, { status });
      setUser({ ...user, status });
      toast.success("Estado actualizado");
    } catch (error) {
      toast.error("Error al actualizar estado");
    } finally {
      setSaving(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user?.status == "pending") {
      handleStatusChange("reviewed");
    }
  }, [handleStatusChange, user]);

  useEffect(() => {
    if (user && originalUser) {
      const { status, ...userWithoutStatus } = user;
      const { status: originalStatus, ...originalUserWithoutStatus } =
        originalUser;
      const isDifferent =
        JSON.stringify(userWithoutStatus) !==
        JSON.stringify(originalUserWithoutStatus);
      setHasUnsavedChanges(isDifferent);
    }
  }, [user, originalUser]);

  useEffect(() => {
    if (user?.licencia) {
      setShowLicenseInput(true);
    }
  }, [user?.licencia]);

  const handleSave = async () => {
    if (!user) return;

    setSubmitAttempted(true);
    const validation = validateCVPayload({
      ...user,
      name: nameFields.name,
      lastName: nameFields.lastName,
    });
    setFieldErrors(validation.success ? {} : validation.errors);

    if (!validation.success) {
      scrollToField(Object.keys(validation.errors)[0] ?? "");
      toast.error("Revisá los campos marcados en rojo");
      return;
    }

    setSaving(true);
    try {
      await updateCV(user._id, user);
      setOriginalUser(JSON.parse(JSON.stringify(user)));
      setHasUnsavedChanges(false);
      setPreviewKey((prev) => prev + 1);
      toast.success("Cambios guardados");
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const generateProfileWithAI = async () => {
    if (!user || user.experience.length === 0) {
      toast.error("Agrega al menos una experiencia laboral");
      return;
    }
    setGeneratingProfile(true);
    try {
      const result = await generateProfileAction(
        user.experience,
        user.skills,
        user.targetJob,
      );
      if (result.success) {
        setUser({ ...user, summary: result.profile });
        toast.success("Perfil generado");
      } else {
        toast.error(result.error || "Error al generar perfil");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al generar perfil");
    } finally {
      setGeneratingProfile(false);
    }
  };

  const generateSkillsWithAI = async () => {
    if (
      !user ||
      (user.experience.length === 0 && user.education.length === 0)
    ) {
      toast.error("Agrega experiencia o educación");
      return;
    }
    setGeneratingProfile(true);
    try {
      const newSkills = await generateSkills(
        user.experience,
        user.education,
        user.targetJob,
      );
      setUser({ ...user, skills: newSkills });
      toast.success("Skills generados");
    } catch (error: any) {
      toast.error(error.message || "Error al generar skills");
    } finally {
      setGeneratingProfile(false);
    }
  };

  const improveDescription = async (expId: string) => {
    if (!user) return;
    const exp = user.experience.find((e: Experience) => e.id === expId);
    if (!exp?.description) {
      toast.error("Agrega una descripción primero");
      return;
    }
    setImprovingText(expId);
    try {
      const result = await improveTextAction(exp.description);
      if (result.success) {
        setUser({
          ...user,
          experience: user.experience.map((e: Experience) =>
            e.id === expId ? { ...e, description: result.improved || "" } : e,
          ),
        });
        toast.success("Descripción mejorada");
      } else {
        toast.error(result.error || "Error al mejorar texto");
      }
    } catch (error) {
      console.error("Error improving text:", error);
      toast.error("Error al mejorar texto");
    } finally {
      setImprovingText(null);
    }
  };

  // Load provincias on mount
  useEffect(() => {
    const loadProvincias = async () => {
      const data = await getProvincias();
      setProvincias(data);
    };
    loadProvincias();
  }, []);

  // Load departamentos when provincia changes
  useEffect(() => {
    const loadDepartamentos = async () => {
      if (!selectedProvincia) {
        setDepartamentos([]);
        setSelectedDepartamento("");
        setSelectedLocalidad("");
        return;
      }
      const data = await getDepartamentos(selectedProvincia);
      setDepartamentos(data);
    };
    loadDepartamentos();
  }, [selectedProvincia]);

  // Update user location when selection changes
  const handleProvinciaChange = (value: string) => {
    setSelectedProvincia(value);
    setSelectedDepartamento("");
    setSelectedLocalidad("");
    setDepartamentos([]);
  };

  const handleDepartamentoChange = (value: string) => {
    setSelectedDepartamento(value);
    setSelectedLocalidad("");
  };

  const handleLocalidadChange = (value: string) => {
    setSelectedLocalidad(value);
  };

  // Update user.location when location selection changes
  useEffect(() => {
    const provinciaNombre = selectedProvincia
      ? provincias.find((p) => p.id === selectedProvincia)?.nombre
      : "";
    const parts = [
      selectedLocalidad || selectedDepartamento,
      provinciaNombre,
    ].filter(Boolean);
    const newLocation = parts.join(", ");
    setUser((current) => {
      if (!current || current.location === newLocation) return current;
      return { ...current, location: newLocation };
    });
  }, [
    selectedProvincia,
    selectedDepartamento,
    selectedLocalidad,
    provincias,
  ]);

  // Initialize location from user data (only once on mount)
  const [locationInitialized, setLocationInitialized] = useState(false);

  useEffect(() => {
    if (
      user &&
      user.location &&
      !locationInitialized &&
      provincias.length > 0
    ) {
      // Try to parse location if it contains comma
      const parts = user.location.split(", ");
      if (parts.length >= 2) {
        const loc = parts[0];
        const prov = parts.slice(1).join(", ");
        // Try to find matching provincia
        const provMatch = provincias.find((p) => p.nombre === prov);
        if (provMatch) {
          setSelectedProvincia(provMatch.id);
          // We'll need to also set the departamento/localidad after loading
        }
      }
      setLocationInitialized(true);
    }
  }, [user, provincias, locationInitialized]);

  // const handleCVUpload = async (file: File) => {
  //   if (!file) return;
  //   if (file.size > 10 * 1024 * 1024) {
  //     toast.error("El archivo debe ser menor a 10MB");
  //     return;
  //   }

  //   if (!user) return;
  //   setUploadingCV(true);
  //   try {
  //     const result = await extractCVAction(file);

  //     if (result.success && result.extracted) {
  //       const extracted = result.extracted;
  //       setUser({
  //         ...user,
  //         fullName: extracted.fullName || user.fullName,
  //         email: extracted.email || user.email,
  //         phone: extracted.phone || user.phone,
  //         location: extracted.location || user.location,
  //         summary: extracted.summary || user.summary,
  //         experience:
  //           extracted.experience && extracted.experience.length > 0
  //             ? extracted.experience
  //             : user.experience,
  //         education:
  //           extracted.education && extracted.education.length > 0
  //             ? extracted.education
  //             : user.education,
  //         skills:
  //           extracted.skills && extracted.skills.length > 0
  //             ? extracted.skills
  //             : user.skills,
  //         languages:
  //           extracted.languages && extracted.languages.length > 0
  //             ? extracted.languages
  //             : user.languages,
  //       });
  //       toast.success("CV procesado correctamente");
  //     } else {
  //       toast.error(result.error || "Error al procesar el CV");
  //     }
  //   } catch (error) {
  //     toast.error("Error al procesar el CV");
  //   } finally {
  //     setUploadingCV(false);
  //   }
  // };

  // const handleDrop = (e: React.DragEvent) => {
  //   e.preventDefault();
  //   const file = e.dataTransfer.files[0];
  //   if (
  //     file &&
  //     (file.type === "application/pdf" || file.type.startsWith("image/"))
  //   ) {
  //     handleCVUpload(file);
  //   }
  // };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processPhotoFile(file);
  };

  const processPhotoFile = async (file: File) => {
    if (!user) return;
    const validation = validateImageFile(file);
    if (!validation.success) {
      toast.error(validation.error);
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadImage(formData);
      if (result.success && result.url) {
        setPhotoPreview(URL.createObjectURL(file));
        setUser({ ...user, photo: result.url });
        toast.success("Foto actualizada");
      } else {
        toast.error(result.error || "Error al subir la foto");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Error al subir la foto");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingPhoto(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      await processPhotoFile(file);
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

  const removePhoto = () => {
    if (!user) return;
    setUser({ ...user, photo: "" });
    setPhotoPreview(null);
    toast.success("Foto eliminada");
  };

  const updateField = (field: string, value: unknown) => {
    if (!user) return;
    const nextUser = { ...user, [field]: value } as UserCV;
    setUser(nextUser);
    validateRealtime(nextUser);
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const addCertification = () => {
    if (!user) return;

    if (!newCertification.title.trim() || !newCertification.institution.trim()) {
      toast.error("Completá el título y la institución");
      return;
    }

    const nextUser = {
      ...user,
      certifications: [
        ...(user.certifications || []),
        {
          id: generateId(),
          title: newCertification.title.trim(),
          institution: newCertification.institution.trim(),
          startMonth: newCertification.startMonth,
          startYear: newCertification.startYear.trim(),
          name: newCertification.title.trim(),
          issuer: newCertification.institution.trim(),
          date: "",
        },
      ],
    } as UserCV;

    setUser(nextUser);
    validateRealtime(nextUser);
    setShowCertificationForm(false);
    setNewCertification({ title: "", institution: "", startMonth: "", startYear: "" });
  };

  const removeCertification = (id: string) => {
    if (!user) return;
    const nextUser = {
      ...user,
      certifications: (user.certifications || []).filter((item) => item.id !== id),
    } as UserCV;

    setUser(nextUser);
    validateRealtime(nextUser);
  };

  const startCertificationEdit = (certification: Certification) => {
    setEditingCertificationId(certification.id);
    setEditingCertificationSnapshot(JSON.parse(JSON.stringify(certification)) as Certification);
  };

  const cancelCertificationEdit = () => {
    if (!user || !editingCertificationSnapshot || !editingCertificationId) {
      setEditingCertificationId(null);
      setEditingCertificationSnapshot(null);
      return;
    }

    const nextUser = {
      ...user,
      certifications: (user.certifications || []).map((item) =>
        item.id === editingCertificationId ? editingCertificationSnapshot : item,
      ),
    } as UserCV;

    setUser(nextUser);
    validateRealtime(nextUser);
    setEditingCertificationId(null);
    setEditingCertificationSnapshot(null);
  };

  const updateCertification = (id: string, field: keyof Certification, value: string) => {
    if (!user) return;

    const index = (user.certifications || []).findIndex((item) => item.id === id);
    const nextUser = {
      ...user,
      certifications: (user.certifications || []).map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              ...(field === "title" ? { name: value } : {}),
              ...(field === "institution" ? { issuer: value } : {}),
            }
          : item,
      ),
    } as UserCV;

    setUser(nextUser);
    validateRealtime(nextUser);

    if (index >= 0) {
      setTouchedFields((prev) => ({
        ...prev,
        [`certifications.${index}.${String(field)}`]: true,
      }));
    }
  };

  const updateNameField = (field: "name" | "lastName", value: string) => {
    if (!user) return;

    const nextNameFields = {
      ...nameFields,
      [field]: value,
    };
    setNameFields(nextNameFields);

    const nextUser = {
      ...user,
      fullName: buildFullName(nextNameFields.name, nextNameFields.lastName),
    };

    setUser(nextUser);
    validateRealtime(nextUser, nextNameFields);
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const updatePersonalLocation = (location: { provincia: string; municipio: string; localidad: string }) => {
    if (!user) return;
    const locationString = [location.localidad || location.municipio, location.provincia]
      .filter(Boolean)
      .join(", ");
    setUser({ 
      ...user, 
      provincia: location.provincia,
      municipio: location.municipio,
      localidad: location.localidad,
      location: locationString 
    });
    setSelectedProvincia(location.provincia);
    setSelectedDepartamento(location.municipio);
    setSelectedLocalidad(location.localidad);
  };

  const updateTemplateSettingsPartial = (
    partial: Partial<UserCV["templateSettings"]>,
  ) => {
    if (!user) return;

    const nextUser = {
      ...user,
      templateSettings: normalizeTemplateSettings(user.selectedTemplate, {
        ...user.templateSettings,
        ...partial,
      }),
    };

    setUser(nextUser);
  };

  const updateTemplateSettings = <K extends keyof UserCV["templateSettings"]>(
    field: K,
    value: UserCV["templateSettings"][K],
  ) => {
    updateTemplateSettingsPartial({
      [field]: value,
    } as Partial<UserCV["templateSettings"]>);
  };

  const updateRangeSetting = (
    field: "headerFontSize" | "bodyFontSize" | "margin" | "padding" | "headerPadding" | "bodyPadding",
    rawValue: string,
  ) => {
    const nextValue = Number.parseInt(rawValue, 10);

    if (Number.isNaN(nextValue)) {
      return;
    }

    updateTemplateSettings(field, nextValue);
  };

  const getSectionOrder = (
    field: "reverseExperience" | "reverseEducation" | "reverseCourses",
  ): LayoutOrder => (user?.templateSettings[field] ? "ascending" : "descending");

  const updateSectionOrder = (
    field: "reverseExperience" | "reverseEducation" | "reverseCourses",
    order: LayoutOrder,
  ) => {
    updateTemplateSettings(field, order === "ascending");
  };

  const updateSelectedTemplate = (templateId: string) => {
    if (!user) return;
    const nextTemplate = templateId as UserCV["selectedTemplate"];
    const primaryColor = sanitizeTemplatePrimaryColor(
      nextTemplate,
      user.templateSettings.primaryColor,
    );

    const nextUser = {
      ...user,
      selectedTemplate: nextTemplate,
      templateSettings: normalizeTemplateSettings(nextTemplate, {
        ...user.templateSettings,
        primaryColor,
      }),
    };

    setUser(nextUser);
  };

  const addExperience = () => {
    if (!user) return;
    setUser({
      ...user,
      experience: [
        ...user.experience,
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
    });
  };

  const removeExperience = (id: string) => {
    if (!user) return;
    setUser({
      ...user,
      experience: user.experience.filter((e: any) => e.id !== id),
    });
  };

  const updateExperience = (id: string, field: string, value: unknown) => {
    if (!user) return;
    const index = user.experience.findIndex((e: any) => e.id === id);
    const nextUser = {
      ...user,
      experience: user.experience.map((e: any) =>
        e.id === id
          ? {
              ...e,
              [field]: value,
              ...(field === "current" && value === true ? { endDate: "" } : {}),
            }
          : e,
      ),
    };

    setUser(nextUser);
    validateRealtime(nextUser);

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
    if (!user) return;
    setUser({
      ...user,
      experience: user.experience.map((e: any) =>
        e.id === id ? { ...e, ...locationData } : e,
      ),
    });
  };

  const addEducation = () => {
    if (!user) return;
    setUser({
      ...user,
      education: [
        ...user.education,
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
    if (!user) return;
    setUser({
      ...user,
      education: user.education.filter((e: any) => e.id !== id),
    });
  };

  const updateEducation = (id: string, field: string, value: unknown) => {
    if (!user) return;
    const index = user.education.findIndex((e: any) => e.id === id);
    const nextUser = {
      ...user,
      education: user.education.map((e: any) =>
        e.id === id
          ? {
              ...e,
              [field]: value,
              ...(field === "current" && value === true ? { endDate: "" } : {}),
            }
          : e,
      ),
    };

    setUser(nextUser);
    validateRealtime(nextUser);

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
    if (!user) return;
    setUser({
      ...user,
      education: user.education.map((e: any) =>
        e.id === id ? { ...e, ...locationData } : e,
      ),
    });
  };

  const addSkill = (skill: string) => {
    if (!user || !skill.trim()) return;
    if (!user.skills.includes(skill.trim())) {
      setUser({ ...user, skills: [...user.skills, skill.trim()] });
    }
  };

  const removeSkill = (skill: string) => {
    if (!user) return;
    setUser({
      ...user,
      skills: user.skills.filter((s: string) => s !== skill),
    });
  };

  // Language functions
  const addLanguage = (language: string, level: string) => {
    if (!user || !language.trim()) return;
    const newLang = { id: generateId(), language: language.trim(), level };
    setUser({ ...user, languages: [...user.languages, newLang] });
  };

  const removeLanguage = (id: string) => {
    if (!user) return;
    setUser({
      ...user,
      languages: user.languages.filter((l: any) => l.id !== id),
    });
  };

  const updateLanguage = (id: string, field: string, value: string) => {
    if (!user) return;
    setUser({
      ...user,
      languages: user.languages.map((l: any) =>
        l.id === id ? { ...l, [field]: value } : l,
      ),
    });
  };

  if (loading) {
    return <AdminCVPageSkeleton />;
  }

  if (!user) return null;

  const previewUrl = `/downloads/cv/${user._id}?t=${previewKey}`;
  const currentPhoto = photoPreview || user.photo;

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            className="fixed inset-x-4 top-4 md:inset-auto md:w-100 md:h-125 bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{
              left: previewPosition.x,
              top: previewPosition.y,
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center justify-between p-2 border-b bg-gray-50 cursor-grab">
              <span className="text-sm font-medium text-black">Vista Previa</span>
              <Button
                variant="ghost"
                size="sm"
                className="shadow-sm dark:bg-black hover:dark:bg-black/50"
                onClick={() => setShowPreview(false)}
              >
                <X className="h-4 w-4 text-white" />
              </Button>
            </div>
            <iframe
              src={previewUrl}
              className="flex-1 w-full rounded-md"
              title="Vista Previa del CV"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 w-full flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div className="flex w-full min-w-0 flex-row items-start gap-3 sm:items-center sm:justify-between lg:w-auto lg:justify-start lg:gap-4">
          <Button
            variant="ghost"
            className="shrink-0 self-start"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="size-6 md:size-4 mr-2" />
            <span className="hidden md:block">Volver</span>
          </Button>
          <div className="min-w-0 flex-1 lg:flex-none">
            <h1 className="text-xl md:text-2xl font-bold wrap-break-word">{user.fullName}</h1>
            <p className="text-muted-foreground text-xs md:text-base wrap-break-word">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 lg:w-auto lg:min-w-[18rem]">
          <div className="flex w-full flex-col gap-2 md:flex-row md:flex-wrap md:justify-end">
            <Button
              variant="outline"
              onClick={handleSave}
              className={cn(
                "w-full md:w-auto",
                hasUnsavedChanges && "border-2 border-red-500"
              )}
              loading={saving}
            >
              <Save className="size-6 md:size-4 mr-2" />
              <span>Guardar</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(!showPreview);
                setPreviewKey((prev) => prev + 1);
              }}
              className="hidden md:inline-flex"
            >
              <Eye className="size-6 md:size-4 md:mr-2" />
              <span className="hidden md:block">
                {showPreview ? "Ocultar" : "Preview"}
              </span>
            </Button>
            <a href={previewUrl} target="_blank" className="w-full md:w-auto">
              <Button variant="default" className="w-full md:w-auto">
                <Download className="size-6 md:size-4 mr-2 " />
                <span>Descargar PDF</span>
              </Button>
            </a>
          </div>
          {hasUnsavedChanges && (
            <div>
              <Badge variant={"destructive"} className=" bg-red-500/70">
                Guardar cambios
              </Badge>
            </div>
          )}
        </div>
      </motion.div>

      {submitAttempted && Object.keys(fieldErrors).length > 0 ? (
        <div className="mb-6">
          <ErrorSummary errors={fieldErrors} onErrorClick={scrollToField} />
        </div>
      ) : null}

      {/* <div
        className="border-2 border-dashed rounded-lg p-4 mb-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => document.getElementById("cv-upload")?.click()}
      >
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {uploadingCV
            ? "Procesando CV..."
            : "Arrastra un CV anterior (PDF o imagen) para auto-completar"}
        </p>
        <input
          id="cv-upload"
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => handleCVUpload(e.target.files?.[0]!)}
          disabled={uploadingCV}
        />
      </div> */}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-2 mb-6"
      >
        <Button
          variant={user.status === "reviewed" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange("reviewed")}
        >
          <Eye className="h-4 w-4 mr-1" />
          Revisando
        </Button>
        <Button
          variant={user.status === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange("completed")}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Completado
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="grid lg:grid-cols-3 gap-8 ">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre *</Label>
                  <Input
                    value={nameFields.name}
                    onChange={(e) => updateNameField("name", e.target.value)}
                    className={cn(getFieldError("name") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("name") && (
                    <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("name")}</p>
                  )}
                </div>
                <div>
                  <Label>Apellido *</Label>
                  <Input
                    value={nameFields.lastName}
                    onChange={(e) => updateNameField("lastName", e.target.value)}
                    className={cn(getFieldError("lastName") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("lastName") && (
                    <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("lastName")}</p>
                  )}
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={user.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={cn(getFieldError("email") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("email") && (
                    <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("email")}</p>
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={user.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    className={cn(getFieldError("phone") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("phone") && (
                    <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("phone")}</p>
                  )}
                </div>
                <div>
                  <Label>DNI (opcional)</Label>
                  <Input
                    value={user.dni || ""}
                    onChange={(e) => updateField("dni", e.target.value)}
                    placeholder="Ej: 12345678"
                    className={cn(getFieldError("dni") && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError("dni") && (
                    <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("dni")}</p>
                  )}
                </div>
              </div>
              <div>
                <Label>Ubicación</Label>
                <div className="mt-2">
                  <LocationSelector
                    value={{
                      provincia: user?.provincia || "",
                      municipio: user?.municipio || "",
                      localidad: user?.localidad || "",
                    }}
                    onChange={updatePersonalLocation}
                    showLabels={true}
                  />
                </div>
              </div>
              <div>
                <Label>Links</Label>
                <Input
                  value={user.links || ""}
                  onChange={(e) => updateField("links", e.target.value)}
                  placeholder="linkedin.com/in/..., instagram.com/..."
                  className={cn(getFieldError("links") && "border-red-500 focus-visible:ring-red-500")}
                />
                {getFieldError("links") && (
                  <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("links")}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="items-center pb-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-base font-semibold">Información adicional</p>
              <div className="grid gap-3 sm:grid-cols-4">
                <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!user.licencia}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateField("licencia", "B");
                      } else {
                        updateField("licencia", "");
                      }
                    }}
                  />
                  <span className="text-sm">Licencia</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!user.movilidad}
                    onChange={(e) => updateField("movilidad", e.target.checked)}
                  />
                  <span className="text-sm">Movilidad propia</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!user.incorporacionInmediata}
                    onChange={(e) => updateField("incorporacionInmediata", e.target.checked)}
                  />
                  <span className="text-sm">Incorporación inmediata</span>
                </label>
                <label className="flex items-center gap-2 rounded-md border bg-background px-3 py-2">
                  <input
                    type="checkbox"
                    checked={!!user.office}
                    onChange={(e) => updateField("office", e.target.checked)}
                  />
                  <span className="text-sm">Microsoft Office</span>
                </label>
              </div>
              {user.licencia && (
                <div>
                  <Label>Tipo de licencia</Label>
                  <Input
                    value={user.licencia}
                    onChange={(e) => updateField("licencia", e.target.value)}
                    placeholder="Ej: B1, profesional, etc."
                  />
                </div>
              )}
              <div>
                <Label>Disponibilidad horaria</Label>
                <Select
                  value={user.disponibilidad || ""}
                  onChange={(e) => updateField("disponibilidad", e.target.value)}
                  options={availabilityOptions}
                  placeholder="Seleccionar disponibilidad"
                />
              </div>
            </CardContent>
          </Card>

          <Card data-section-id="certifications">
            <CardHeader className="items-center pb-2">
              <BookOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <p className="w-full text-center text-base font-semibold">Cursos y certificaciones</p>
                {!showCertificationForm ? (
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCertificationForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar
                  </Button>
                ) : null}
              </div>

              {!showCertificationForm ? (
                <div className="text-sm text-muted-foreground">Completá tus cursos y certificaciones para destacarlos en el CV.</div>
              ) : (
                <div className="grid gap-3 rounded-md border p-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label>Título del curso</Label>
                      <Input
                        data-field-id="certifications.new.title"
                        value={newCertification.title}
                        onChange={(e) => setNewCertification((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej: Excel avanzado"
                      />
                    </div>
                    <div>
                      <Label>Institución</Label>
                      <Input
                        data-field-id="certifications.new.institution"
                        value={newCertification.institution}
                        onChange={(e) => setNewCertification((prev) => ({ ...prev, institution: e.target.value }))}
                        placeholder="Ej: Universidad X"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label>Mes de inicio</Label>
                      <Select
                        data-field-id="certifications.new.startMonth"
                        value={newCertification.startMonth}
                        onChange={(e) => setNewCertification((prev) => ({ ...prev, startMonth: e.target.value }))}
                        options={monthSelectOptions}
                        placeholder="Seleccionar mes"
                      />
                    </div>
                    <div>
                      <Label>Año de inicio</Label>
                      <Select
                        data-field-id="certifications.new.startYear"
                        value={newCertification.startYear}
                        onChange={(e) => setNewCertification((prev) => ({ ...prev, startYear: e.target.value }))}
                        options={yearSelectOptions}
                        placeholder="Seleccionar año"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={addCertification}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowCertificationForm(false);
                      setNewCertification({ title: "", institution: "", startMonth: "", startYear: "" });
                    }}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {(user.certifications || []).length > 0 ? (
                  (user.certifications || []).map((course) => (
                    <div key={course.id} className="rounded-md border p-3 space-y-3">
                      {editingCertificationId === course.id ? (
                        <div className="space-y-3">
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <Label>Título del curso</Label>
                              <Input
                                data-field-id={`certifications.${(user.certifications || []).findIndex((item) => item.id === course.id)}.title`}
                                value={course.title ?? ""}
                                onChange={(e) => updateCertification(course.id, "title", e.target.value)}
                              />
                            </div>
                            <div>
                              <Label>Institución</Label>
                              <Input
                                data-field-id={`certifications.${(user.certifications || []).findIndex((item) => item.id === course.id)}.institution`}
                                value={course.institution ?? ""}
                                onChange={(e) => updateCertification(course.id, "institution", e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <Label>Mes de inicio</Label>
                              <Select
                                data-field-id={`certifications.${(user.certifications || []).findIndex((item) => item.id === course.id)}.startMonth`}
                                value={course.startMonth ?? ""}
                                onChange={(e) => updateCertification(course.id, "startMonth", e.target.value)}
                                options={monthSelectOptions}
                                placeholder="Seleccionar mes"
                              />
                            </div>
                            <div>
                              <Label>Año de inicio</Label>
                              <Select
                                data-field-id={`certifications.${(user.certifications || []).findIndex((item) => item.id === course.id)}.startYear`}
                                value={course.startYear ?? ""}
                                onChange={(e) => updateCertification(course.id, "startYear", e.target.value)}
                                options={yearSelectOptions}
                                placeholder="Seleccionar año"
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={() => setEditingCertificationId(null)}>
                              Guardar
                            </Button>
                            <Button type="button" variant="outline" onClick={cancelCertificationEdit}>
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium">{course.title || course.name || "Sin título"}</p>
                            {course.institution || course.issuer ? (
                              <p className="text-sm text-muted-foreground">{course.institution || course.issuer}</p>
                            ) : null}
                            <p className="text-xs text-muted-foreground">
                              {[course.startMonth, course.startYear].filter(Boolean).join("/") || "Sin fecha"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => startCertificationEdit(course)}>
                              <Sparkles className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeCertification(course.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Aún no agregaste cursos ni certificaciones.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experiencia Laboral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.experience.map((exp: any, index: number) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border rounded-lg space-y-3"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-2 min-w-0">
                      <Input
                        placeholder="Empresa"
                        value={exp.company}
                        onChange={(e) =>
                          updateExperience(exp.id, "company", e.target.value)
                        }
                        className={cn(
                          "w-full",
                          getFieldError(`experience.${index}.company`) && "border-red-500 focus-visible:ring-red-500",
                        )}
                      />
                      {getFieldError(`experience.${index}.company`) && (
                        <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`experience.${index}.company`)}</p>
                      )}
                      <Input
                        placeholder="Puesto"
                        value={exp.position}
                        onChange={(e) =>
                          updateExperience(exp.id, "position", e.target.value)
                        }
                        className={cn(getFieldError(`experience.${index}.position`) && "border-red-500 focus-visible:ring-red-500")}
                      />
                      {getFieldError(`experience.${index}.position`) && (
                        <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`experience.${index}.position`)}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="self-end sm:self-start shrink-0"
                      onClick={() => removeExperience(exp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <ExperienceLocationSelector
                    experienciaId={exp.id}
                    initialProvincia={exp.provincia}
                    initialMunicipio={exp.municipio}
                    initialLocalidad={exp.localidad}
                    onChange={updateExperienceLocation}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, "startDate", e.target.value)
                      }
                      className={cn(getFieldError(`experience.${index}.startDate`) && "border-red-500 focus-visible:ring-red-500")}
                    />
                    <Input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) =>
                        updateExperience(exp.id, "endDate", e.target.value)
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) =>
                          updateExperience(exp.id, "current", e.target.checked)
                        }
                      />
                      <span className="text-sm">Trabajo actual</span>
                    </label>

                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => improveDescription(exp.id)}
                      disabled={improvingText === exp.id}
                      title="Mejorar descripción con IA"
                      className="flex w-full gap-2 sm:w-auto"
                    >
                      {improvingText === exp.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Wand2 className="h-4 w-4" />
                      )}

                      <span className="hidden md:block">
                        Mejorar descripción con IA
                      </span>
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Funciones y logros"
                      value={exp.description}
                      onChange={(e) =>
                        updateExperience(exp.id, "description", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </motion.div>
              ))}
              <Button variant="outline" onClick={addExperience}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar experiencia
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Educación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.education.map((edu: any, index: number) => (
                <motion.div
                  key={index + "educacion"}
                  className="p-4 border rounded-lg space-y-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <Input
                      placeholder="Institución"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, "institution", e.target.value)
                      }
                      className={cn(
                        "w-full flex-1 min-w-0",
                        getFieldError(`education.${index}.institution`) && "border-red-500 focus-visible:ring-red-500",
                      )}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="self-end sm:self-start shrink-0"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Título / Carrera"
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, "degree", e.target.value)
                    }
                    className={cn(getFieldError(`education.${index}.degree`) && "border-red-500 focus-visible:ring-red-500")}
                  />
                  {getFieldError(`education.${index}.institution`) && (
                    <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.institution`)}</p>
                  )}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(edu.id, "startDate", e.target.value)
                      }
                      className={cn(getFieldError(`education.${index}.startDate`) && "border-red-500 focus-visible:ring-red-500")}
                    />
                    <Input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(edu.id, "endDate", e.target.value)
                      }
                      className={cn(getFieldError(`education.${index}.endDate`) && "border-red-500 focus-visible:ring-red-500")}
                    />
                  </div>
                  {getFieldError(`education.${index}.startDate`) && (
                    <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.startDate`)}</p>
                  )}
                  {getFieldError(`education.${index}.endDate`) && (
                    <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError(`education.${index}.endDate`)}</p>
                  )}
                </motion.div>
              ))}
              <Button variant="outline" onClick={addEducation}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar educación
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Habilidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between mb-4">
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <Input placeholder="Agregar habilidad" id="newSkill" className="w-full" />
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
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
                <Button
                  variant="outline"
                  className="w-full lg:w-auto"
                  onClick={generateSkillsWithAI}
                  disabled={generatingProfile}
                >
                  {generatingProfile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden md:block">Generar skills con IA</span>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.skills.map((skill: string, index: number) => (
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
            <CardHeader>
              <CardTitle>Idiomas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex w-full min-w-0 flex-col gap-2 md:flex-row">
                <Input
                  placeholder="Idioma (ej: Inglés)"
                  id="newLanguage"
                  className="w-full md:flex-1"
                />
                <select
                  id="newLanguageLevel"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                >
                  <option value="" disabled hidden>Idioma</option>
                  <option value="Básico">Básico</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                  <option value="Nativo">Nativo</option>
                </select>
                <Button
                  type="button"
                  className="w-full md:w-auto"
                  onClick={() => {
                    const input = document.getElementById(
                      "newLanguage",
                    ) as HTMLInputElement;
                    const select = document.getElementById(
                      "newLanguageLevel",
                    ) as HTMLSelectElement;
                    addLanguage(input.value, select.value);
                    input.value = "";
                    select.value = "Básico";
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {user.languages.map((lang: any) => (
                  <div key={lang.id} className="flex w-full min-w-0 flex-col gap-2 rounded border p-2 md:flex-row md:items-center">
                    <Input
                      value={lang.language || ""}
                      onChange={(e) =>
                        updateLanguage(lang.id, "language", e.target.value)
                      }
                      className="w-full md:flex-1"
                    />
                    <select
                      value={lang.level || "Básico"}
                      onChange={(e) =>
                        updateLanguage(lang.id, "level", e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
                    >
                      <option value="" disabled hidden>Nivel</option>
                      <option value="Básico">Básico</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Avanzado">Avanzado</option>
                      <option value="Nativo">Nativo</option>
                    </select>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="self-end md:self-auto"
                      onClick={() => removeLanguage(lang.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfil / Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mb-2 lg:flex-row lg:items-center lg:justify-between">
                <Input
                  placeholder="Puesto aspirado (para generar perfil ATS)"
                  value={user.targetJob || ""}
                  onChange={(e) => updateField("targetJob", e.target.value)}
                  className={cn(
                    "flex-1",
                    getFieldError("targetJob") && "border-red-500 focus-visible:ring-red-500",
                  )}
                />
                <Button
                  variant="outline"
                  onClick={generateProfileWithAI}
                  disabled={generatingProfile || user.experience.length === 0}
                  title="Generar perfil con IA"
                  className="w-full lg:w-auto"
                >
                  {generatingProfile ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  <span className="hidden md:block">Generar perfil con IA</span>
                </Button>
              </div>
              <Textarea
                value={user.summary || ""}
                onChange={(e) => updateField("summary", e.target.value)}
                placeholder="Resumen del perfil profesional..."
                className={cn(
                  "min-h-25",
                  getFieldError("summary") && "border-red-500 focus-visible:ring-red-500",
                )}
              />
              {getFieldError("targetJob") && (
                <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("targetJob")}</p>
              )}
              {getFieldError("summary") && (
                <p className="mt-1 rounded bg-red-50 px-2 py-1 text-xs text-red-600">{getFieldError("summary")}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del CV</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Plantilla</Label>
                <div className="mt-2">
                  <TemplateCarousel
                    templates={templateOptions}
                    selectedTemplate={user.selectedTemplate}
                    onSelectTemplate={updateSelectedTemplate}
                    desktopPerView={3}
                  />
                </div>
              </div>

              <div>
                <Label>Color del diseño</Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {getTemplatePalette(user.selectedTemplate).map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        updateTemplateSettings("primaryColor", color)
                      }
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        user.templateSettings.primaryColor === color
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105",
                      )}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Tamaño de fuente</Label>
                <div className="mt-2 space-y-3">
                  <label className="block text-xs text-muted-foreground">
                    Encabezado: {user.templateSettings.headerFontSize}
                  </label>
                  <input
                    type="range"
                    min={16}
                    max={40}
                    step={1}
                    value={user.templateSettings.headerFontSize}
                    onChange={(e) => updateRangeSetting("headerFontSize", e.target.value)}
                    className="w-full"
                  />
                  <label className="block text-xs text-muted-foreground">
                    Cuerpo: {user.templateSettings.bodyFontSize}
                  </label>
                  <input
                    type="range"
                    min={8}
                    max={16}
                    step={1}
                    value={user.templateSettings.bodyFontSize}
                    onChange={(e) => updateRangeSetting("bodyFontSize", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label>Espaciado</Label>
                <div className="mt-2 space-y-3">
                  <label className="block text-xs text-muted-foreground">
                    Margen general: {user.templateSettings.margin}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={1}
                    value={user.templateSettings.margin}
                    onChange={(e) => updateRangeSetting("margin", e.target.value)}
                    className="w-full"
                  />
                  <label className="block text-xs text-muted-foreground">
                    Padding general: {user.templateSettings.padding}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={1}
                    value={user.templateSettings.padding}
                    onChange={(e) => updateRangeSetting("padding", e.target.value)}
                    className="w-full"
                  />
                  <label className="block text-xs text-muted-foreground">
                    Padding encabezado: {user.templateSettings.headerPadding}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={1}
                    value={user.templateSettings.headerPadding}
                    onChange={(e) => updateRangeSetting("headerPadding", e.target.value)}
                    className="w-full"
                  />
                  <label className="block text-xs text-muted-foreground">
                    Padding cuerpo: {user.templateSettings.bodyPadding}
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={60}
                    step={1}
                    value={user.templateSettings.bodyPadding}
                    onChange={(e) => updateRangeSetting("bodyPadding", e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Label>Orden cronológico por sección</Label>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">Experiencia</span>
                    <Select
                      className="mt-1"
                      value={getSectionOrder("reverseExperience")}
                      options={layoutOptions}
                      onChange={(e) => updateSectionOrder("reverseExperience", e.target.value as LayoutOrder)}
                      placeholder="Seleccionar orden"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Educación</span>
                    <Select
                      className="mt-1"
                      value={getSectionOrder("reverseEducation")}
                      options={layoutOptions}
                      onChange={(e) => updateSectionOrder("reverseEducation", e.target.value as LayoutOrder)}
                      placeholder="Seleccionar orden"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Certificaciones</span>
                    <Select
                      className="mt-1"
                      value={getSectionOrder("reverseCourses")}
                      options={layoutOptions}
                      onChange={(e) => updateSectionOrder("reverseCourses", e.target.value as LayoutOrder)}
                      placeholder="Seleccionar orden"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Opciones de visualización</Label>
                <label className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(user.templateSettings.fullName)}
                    onChange={(e) => updateTemplateSettings("fullName", e.target.checked)}
                  />
                  <span>Mostrar nombre completo</span>
                </label>
                <label className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={Boolean(user.templateSettings.spaceBetween)}
                    onChange={(e) => updateTemplateSettings("spaceBetween", e.target.checked)}
                  />
                  <span>Aumentar separación entre secciones</span>
                </label>
              </div>

              <div>
                <Label>Visibilidad de secciones</Label>
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {VISIBILITY_SETTINGS.map((option) => (
                    <label
                      key={option.key}
                      className="flex items-center gap-2 rounded border px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(user.templateSettings[option.key])}
                        onChange={(e) => updateTemplateSettings(option.key, e.target.checked)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Foto de perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handlePhotoDrop}
                  className={cn(
                    "relative w-32 h-32 rounded-full overflow-hidden border-2 transition-all cursor-pointer",
                    isDraggingPhoto
                      ? "border-primary border-dashed scale-105"
                      : "border-transparent",
                  )}
                >
                  {currentPhoto ? (
                    <Image
                      src={currentPhoto}
                      alt={user.fullName}
                      fill
                      sizes="128px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground text-xs text-center p-2">
                        Sin foto
                      </span>
                    </div>
                  )}
                  {uploadingPhoto ? (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    disabled={uploadingPhoto}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG hasta 1MB
                </p>
                {(user.photo || photoPreview) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={removePhoto}
                    disabled={uploadingPhoto}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar foto
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

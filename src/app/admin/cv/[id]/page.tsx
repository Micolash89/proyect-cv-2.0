"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Clock,
  Upload,
  FileText,
  Loader2,
  Wand2,
} from "lucide-react";
import { generateId, cn } from "@/lib/utils/cn";
import type {
  TemplateType,
  FontSize,
  LayoutOrder,
  CVStatus,
  UserCV,
  Experience,
  Education,
  Language,
} from "@/types";
import { getCV, updateCV } from "@/app/actions/cv";
import { uploadImage } from "@/app/actions/upload";
import {
  extractCVAction,
  improveTextAction,
  generateProfileAction,
} from "@/app/actions/ia";
import { generateSkills } from "@/lib/ia/factory";

const colorPalette = [
  { name: "Gris Oscuro", value: "#374151" },
  { name: "Gris", value: "#6b7280" },
  { name: "Azul Noche", value: "#1e3a5f" },
  { name: "Bordó", value: "#7f1d1d" },
  { name: "Verde Oliva", value: "#3f6212" },
  { name: "Marrón", value: "#78350f" },
  { name: "Negro", value: "#111827" },
  { name: "Gris Claro", value: "#9ca3af" },
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
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - previewPosition.x,
      y: e.clientY - previewPosition.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPreviewPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove as any);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove as any);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  useEffect(() => {
    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  useEffect(() => {
    if (user && user?.status == "pending") {
      handleStatusChange("reviewed");
    }
  }, [user]);

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

  const fetchUser = async () => {
    try {
      const { user } = await getCV(params.id as string);
      setUser(user);
      setOriginalUser(JSON.parse(JSON.stringify(user)));
    } catch (error) {
      console.error("Error fetching user:", error);
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

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

  const handleStatusChange = async (status: CVStatus) => {
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

  const handleCVUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo debe ser menor a 10MB");
      return;
    }

    if (!user) return;
    setUploadingCV(true);
    try {
      const result = await extractCVAction(file);

      if (result.success && result.extracted) {
        const extracted = result.extracted;
        setUser({
          ...user,
          fullName: extracted.fullName || user.fullName,
          email: extracted.email || user.email,
          phone: extracted.phone || user.phone,
          location: extracted.location || user.location,
          summary: extracted.summary || user.summary,
          experience:
            extracted.experience && extracted.experience.length > 0
              ? extracted.experience
              : user.experience,
          education:
            extracted.education && extracted.education.length > 0
              ? extracted.education
              : user.education,
          skills:
            extracted.skills && extracted.skills.length > 0
              ? extracted.skills
              : user.skills,
          languages:
            extracted.languages && extracted.languages.length > 0
              ? extracted.languages
              : user.languages,
        });
        toast.success("CV procesado correctamente");
      } else {
        toast.error(result.error || "Error al procesar el CV");
      }
    } catch (error) {
      toast.error("Error al procesar el CV");
    } finally {
      setUploadingCV(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (
      file &&
      (file.type === "application/pdf" || file.type.startsWith("image/"))
    ) {
      handleCVUpload(file);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processPhotoFile(file);
  };

  const processPhotoFile = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("El archivo debe ser una imagen");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
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

  const updateField = (field: string, value: any) => {
    if (!user) return;
    setUser({ ...user, [field]: value });
  };

  const updateTemplateSettings = (field: string, value: any) => {
    if (!user) return;
    setUser({
      ...user,
      templateSettings: { ...user.templateSettings, [field]: value },
    });
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

  const updateExperience = (id: string, field: string, value: any) => {
    if (!user) return;
    setUser({
      ...user,
      experience: user.experience.map((e: any) =>
        e.id === id ? { ...e, [field]: value } : e,
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
          field: "",
          startDate: "",
          endDate: "",
          current: false,
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

  const updateEducation = (id: string, field: string, value: any) => {
    if (!user) return;
    setUser({
      ...user,
      education: user.education.map((e: any) =>
        e.id === id ? { ...e, [field]: value } : e,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const previewUrl = `/downloads/cv/${user._id}?t=${previewKey}`;

  return (
    <div className="container mx-auto px-4 py-8">
      {showPreview && (
        <div 
          className="fixed w-100 h-125 bg-white border-2 border-gray-300 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
          style={{ 
            left: previewPosition.x, 
            top: previewPosition.y,
            cursor: isDragging ? 'grabbing' : 'grab',
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
        </div>
      )}

      <div className="flex items-center flex-col gap-5 md:gap-0 md:justify-between md:flex-row mb-8 ">
        <div className="flex items-center  md:gap-4 w-full md:w-fit justify-between md:justify-items-normal">
          <Button
            variant="ghost"
            className="self-start md:self-auto"
            onClick={() => router.push("/admin")}
          >
            <ArrowLeft className="size-6 md:size-4 mr-2" />
            <span className="hidden md:block">Volver</span>
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{user.fullName}</h1>
            <p className="text-muted-foreground text-xs md:text-base">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full md:w-fit ">
          <div className="flex gap-2 ">
            <Button
              variant="outline"
              onClick={handleSave}
              className={`${hasUnsavedChanges && "border-2 border-red-500"}`}
              loading={saving}
            >
              <Save className="size-6 md:size-4 mr-2" />
              <span className="">Guardar</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowPreview(!showPreview);
                setPreviewKey((prev) => prev + 1);
              }}
              className="hidden md:flex"
            >
              <Eye className="size-6 md:size-4 md:mr-2" />
              <span className="hidden md:block">
                {showPreview ? "Ocultar" : "Preview"}
              </span>
            </Button>
            <a href={previewUrl} target="_blank">
              <Button variant="default">
                <Download className="size-6 md:size-4 mr-2 " />
                <span className="">Descargar PDF</span>
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
      </div>

      <div
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
      </div>

      <div className="flex gap-2 mb-6">
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
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nombre completo</Label>
                  <Input
                    value={user.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={user.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Teléfono</Label>
                  <Input
                    value={user.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Ubicación</Label>
                  <Input
                    value={user.location || ""}
                    onChange={(e) => updateField("location", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label>Links</Label>
                <Input
                  value={user.links || ""}
                  onChange={(e) => updateField("links", e.target.value)}
                  placeholder="linkedin.com/in/..., instagram.com/..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Experiencia Laboral</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.experience.map((exp: any) => (
                <div key={exp.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <Input
                      placeholder="Empresa"
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, "company", e.target.value)
                      }
                      className="w-1/2"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExperience(exp.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Puesto"
                    value={exp.position}
                    onChange={(e) =>
                      updateExperience(exp.id, "position", e.target.value)
                    }
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, "startDate", e.target.value)
                      }
                    />
                    <Input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) =>
                        updateExperience(exp.id, "endDate", e.target.value)
                      }
                      disabled={exp.current}
                    />
                  </div>
                  <div className="flex justify-between ">
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
                      className="gap-2 flex"
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
                </div>
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
              {user.education.map((edu: any) => (
                <div key={edu.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <Input
                      placeholder="Institución"
                      value={edu.institution}
                      onChange={(e) =>
                        updateEducation(edu.id, "institution", e.target.value)
                      }
                      className="w-1/2"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEducation(edu.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Título"
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(edu.id, "degree", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Campo de estudio"
                      value={edu.field || ""}
                      onChange={(e) =>
                        updateEducation(edu.id, "field", e.target.value)
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) =>
                        updateEducation(edu.id, "startDate", e.target.value)
                      }
                    />
                    <Input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) =>
                        updateEducation(edu.id, "endDate", e.target.value)
                      }
                    />
                  </div>
                </div>
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
              <div className="flex justify-between mb-4">
                <div className="flex gap-2">
                  <Input placeholder="Agregar habilidad" id="newSkill" />
                  <Button
                    type="button"
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
                {user.skills.map((skill: string) => (
                  <Badge
                    key={skill}
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
              <CardTitle>Perfil / Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex mb-2 justify-between">
                <Input
                  placeholder="Puesto aspirado (para generar perfil ATS)"
                  value={user.targetJob || ""}
                  onChange={(e) => updateField("targetJob", e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={generateProfileWithAI}
                  disabled={generatingProfile || user.experience.length === 0}
                  title="Generar perfil con IA"
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
                className="min-h-25"
              />
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
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[
                    {
                      id: "harvard",
                      name: "Harvard",
                      img: "/templates/template-0.png",
                    },
                    {
                      id: "modern",
                      name: "Moderno",
                      img: "/templates/template-1.png",
                    },
                    {
                      id: "classic",
                      name: "Clásico",
                      img: "/templates/template-2.png",
                    },
                    {
                      id: "creative",
                      name: "Creativo",
                      img: "/templates/template-3.png",
                    },
                    {
                      id: "minimal",
                      name: "Minimal",
                      img: "/templates/template-4.png",
                    },
                    {
                      id: "professional",
                      name: "Profesional",
                      img: "/templates/template-5.png",
                    },
                    {
                      id: "layout6",
                      name: "Elegante",
                      img: "/templates/template-6.jpg",
                    },
                    {
                      id: "layout7",
                      name: "Moderno",
                      img: "/templates/template-7.png",
                    },
                  ].map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() =>
                        updateField("selectedTemplate", template.id)
                      }
                      className={cn(
                        "p-1 border-2 rounded-lg transition-all",
                        user.selectedTemplate === template.id
                          ? "border-foreground scale-105"
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
                      <p className="text-xs text-center mt-1">
                        {template.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Color del diseño</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() =>
                        updateTemplateSettings("primaryColor", color.value)
                      }
                      className={cn(
                        "h-10 rounded-lg border-2 transition-all",
                        user.templateSettings.primaryColor === color.value
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105",
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>Tamaño de fuente</Label>
                <Select
                  value={user.templateSettings.fontSize}
                  onChange={(e) =>
                    updateTemplateSettings("fontSize", e.target.value)
                  }
                  options={[
                    { value: "small", label: "Pequeño" },
                    { value: "medium", label: "Mediano" },
                    { value: "large", label: "Grande" },
                  ]}
                />
              </div>

              <div>
                <Label>Orden de experiencia</Label>
                <Select
                  value={user.templateSettings.layout}
                  onChange={(e) =>
                    updateTemplateSettings("layout", e.target.value)
                  }
                  options={[
                    { value: "descending", label: "Más reciente primero" },
                    { value: "ascending", label: "Más antiguo primero" },
                  ]}
                />
              </div>

              <div>
                <Label>Padding: {user.templateSettings.padding}px</Label>
                <input
                  type="range"
                  min="10"
                  max="40"
                  value={user.templateSettings.padding}
                  onChange={(e) =>
                    updateTemplateSettings("padding", parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div>
                <Label>Margin: {user.templateSettings.margin}px</Label>
                <input
                  type="range"
                  min="10"
                  max="30"
                  value={user.templateSettings.margin}
                  onChange={(e) =>
                    updateTemplateSettings("margin", parseInt(e.target.value))
                  }
                  className="w-full"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold">Configuración Avanzada</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tamaño fuente título</Label>
                  <Select
                    value={user.templateSettings.fontSize || "medium"}
                    onChange={(e) =>
                      updateTemplateSettings("fontSize", e.target.value)
                    }
                    options={[
                      { value: "small", label: "Pequeño (20px)" },
                      { value: "medium", label: "Mediano (24px)" },
                      { value: "large", label: "Grande (28px)" },
                    ]}
                  />
                </div>

                <div>
                  <Label>Padding general</Label>
                  <Select
                    value={String(user.templateSettings.padding || 40)}
                    onChange={(e) =>
                      updateTemplateSettings("padding", parseInt(e.target.value))
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
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={user.templateSettings.fullName !== false}
                    onChange={(e) =>
                      updateTemplateSettings("fullName", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Mostrar nombre completo
                </Label>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold">Orden de contenido</Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={user.templateSettings.reverseExperience || false}
                      onChange={(e) =>
                        updateTemplateSettings("reverseExperience", e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    Invertir experiencia
                  </Label>
                </div>
                <div>
                  <Label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={user.templateSettings.reverseEducation || false}
                      onChange={(e) =>
                        updateTemplateSettings("reverseEducation", e.target.checked)
                      }
                      className="w-4 h-4"
                    />
                    Invertir educación
                  </Label>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold">Mostrar secciones</Label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={user.templateSettings.showPhoto !== false}
                    onChange={(e) =>
                      updateTemplateSettings("showPhoto", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Foto
                </Label>
                <Label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={user.templateSettings.showSummary !== false}
                    onChange={(e) =>
                      updateTemplateSettings("showSummary", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Resumen
                </Label>
                <Label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={user.templateSettings.showSkills !== false}
                    onChange={(e) =>
                      updateTemplateSettings("showSkills", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Habilidades
                </Label>
                <Label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={user.templateSettings.showLanguages !== false}
                    onChange={(e) =>
                      updateTemplateSettings("showLanguages", e.target.checked)
                    }
                    className="w-4 h-4"
                  />
                  Idiomas
                </Label>
              </div>

              <div
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: user.templateSettings.primaryColor + "20",
                }}
              >
                <p className="text-sm font-medium mb-2">Preview color</p>
                <div
                  className="h-8 rounded"
                  style={{
                    backgroundColor: user.templateSettings.primaryColor,
                  }}
                />
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
                  {photoPreview || user.photo ? (
                    <img
                      src={photoPreview || user.photo}
                      alt={user.fullName}
                      className="w-full h-full object-cover"
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
      </div>
    </div>
  );
}

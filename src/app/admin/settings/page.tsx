"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Key, MessageCircle, Mail, Bot, CheckCircle, XCircle } from "lucide-react";
import type { IAType, Settings } from "@/types";
import { getSettingsAction, saveSettingsAction } from "@/app/actions/settings";
import { improveTextAction } from "@/app/actions/ia";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    whatsappNumber: "",
    geminiApiKey: "",
    claudeApiKey: "",
    groqApiKey: "",
    activeIA: "gemini",
    emailHost: "",
    emailPort: "",
    emailUser: "",
    emailPassword: "",
    emailFrom: "",
    defaultFontSize: "medium",
    defaultLayout: "descending",
    defaultPadding: 40,
    defaultMargin: 20,
    showPhoto: true,
    showSummary: true,
    showSkills: true,
    showLanguages: true,
    showProjects: false,
    showCertifications: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingIA, setTestingIA] = useState(false);
  const [iaStatus, setIaStatus] = useState<{ gemini: boolean; claude: boolean; groq: boolean }>({
    gemini: false,
    claude: false,
    groq: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { settings } = await getSettingsAction();
      if (settings) {
        setSettings(settings);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await saveSettingsAction(settings);
      if (result.success) {
        toast.success("Configuración guardada");
      } else {
        toast.error(result.error || "Error al guardar");
      }
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const testIA = async (ia: IAType) => {
    setTestingIA(true);
    try {
      const result = await improveTextAction("test");
      setIaStatus((prev) => ({ ...prev, [ia]: result.success }));
      if (result.success) {
        toast.success(`${ia === "gemini" ? "Gemini" : "Claude"} configurado correctamente`);
      } else {
        toast.error("Error al conectar con la IA");
      }
    } catch (error) {
      setIaStatus((prev) => ({ ...prev, [ia]: false }));
      toast.error("Error al conectar con la IA");
    } finally {
      setTestingIA(false);
    }
  };

  const updateSetting = (field: string, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Configura las opciones del sistema
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp
              </CardTitle>
              <CardDescription>
                Número de WhatsApp para confirmar con los clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Número de teléfono</Label>
                <Input
                  placeholder="5491112345678"
                  value={settings.whatsappNumber}
                  onChange={(e) => updateSetting("whatsappNumber", e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Incluye el código de país sin el +
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Inteligencia Artificial
              </CardTitle>
              <CardDescription>
                Configura los proveedores de IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>IA activa</Label>
                <Select
                  value={settings.activeIA}
                  onChange={(e) => updateSetting("activeIA", e.target.value)}
                  options={[
                    { value: "groq", label: "Groq (Gratis - Rápido)" },
                    { value: "gemini", label: "Gemini (Google)" },
                    { value: "claude", label: "Claude (Anthropic)" },
                  ]}
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <Label>Groq API Key</Label>
                  <div className="flex items-center gap-2">
                    {iaStatus.groq ? (
                      <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> OK</Badge>
                    ) : settings.groqApiKey ? (
                      <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>
                    ) : null}
                  </div>
                </div>
                <Input
                  type="password"
                  placeholder="gsk_..."
                  value={settings.groqApiKey}
                  onChange={(e) => updateSetting("groqApiKey", e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => testIA("groq")}
                  disabled={testingIA || !settings.groqApiKey}
                >
                  {testingIA ? "Probando..." : "Probar conexión"}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <Label>Gemini API Key</Label>
                  <div className="flex items-center gap-2">
                    {iaStatus.gemini ? (
                      <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> OK</Badge>
                    ) : settings.geminiApiKey ? (
                      <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>
                    ) : null}
                  </div>
                </div>
                <Input
                  type="password"
                  placeholder="AIza..."
                  value={settings.geminiApiKey}
                  onChange={(e) => updateSetting("geminiApiKey", e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => testIA("gemini")}
                  disabled={testingIA || !settings.geminiApiKey}
                >
                  {testingIA ? "Probando..." : "Probar conexión"}
                </Button>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <Label>Claude API Key</Label>
                  <div className="flex items-center gap-2">
                    {iaStatus.claude ? (
                      <Badge variant="success"><CheckCircle className="h-3 w-3 mr-1" /> OK</Badge>
                    ) : settings.claudeApiKey ? (
                      <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>
                    ) : null}
                  </div>
                </div>
                <Input
                  type="password"
                  placeholder="sk-ant-..."
                  value={settings.claudeApiKey}
                  onChange={(e) => updateSetting("claudeApiKey", e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => testIA("claude")}
                  disabled={testingIA || !settings.claudeApiKey}
                >
                  {testingIA ? "Probando..." : "Probar conexión"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración de Email
              </CardTitle>
              <CardDescription>
                Configura el servidor SMTP para enviar notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Servidor SMTP</Label>
                <Input
                  placeholder="smtp.gmail.com"
                  value={settings.emailHost}
                  onChange={(e) => updateSetting("emailHost", e.target.value)}
                />
              </div>
              <div>
                <Label>Puerto</Label>
                <Input
                  placeholder="587"
                  value={settings.emailPort}
                  onChange={(e) => updateSetting("emailPort", e.target.value)}
                />
              </div>
              <div>
                <Label>Usuario / Email</Label>
                <Input
                  placeholder="tu@email.com"
                  value={settings.emailUser}
                  onChange={(e) => updateSetting("emailUser", e.target.value)}
                />
              </div>
              <div>
                <Label>Contraseña / App Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={settings.emailPassword}
                  onChange={(e) => updateSetting("emailPassword", e.target.value)}
                />
              </div>
              <div>
                <Label>Email remitente</Label>
                <Input
                  placeholder="CV Generator <noreply@email.com>"
                  value={settings.emailFrom}
                  onChange={(e) => updateSetting("emailFrom", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuración de PDF</CardTitle>
              <CardDescription>
                Opciones predeterminadas para los CVs generados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tamaño de fuente</Label>
                  <Select
                    value={settings.defaultFontSize}
                    onChange={(e) => updateSetting("defaultFontSize", e.target.value)}
                    options={[
                      { value: "small", label: "Pequeño" },
                      { value: "medium", label: "Mediano" },
                      { value: "large", label: "Grande" },
                    ]}
                  />
                </div>
                <div>
                  <Label>Orden de experiencias</Label>
                  <Select
                    value={settings.defaultLayout}
                    onChange={(e) => updateSetting("defaultLayout", e.target.value)}
                    options={[
                      { value: "descending", label: "Más reciente primero" },
                      { value: "ascending", label: "Más antiguo primero" },
                    ]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Padding: {settings.defaultPadding}px</Label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={settings.defaultPadding}
                    onChange={(e) => updateSetting("defaultPadding", parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Margin: {settings.defaultMargin}px</Label>
                  <input
                    type="range"
                    min="10"
                    max="40"
                    value={settings.defaultMargin}
                    onChange={(e) => updateSetting("defaultMargin", parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="mb-2 block">Secciones a mostrar por defecto</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: "showPhoto", label: "Foto de perfil" },
                    { key: "showSummary", label: "Resumen/Perfil" },
                    { key: "showSkills", label: "Habilidades" },
                    { key: "showLanguages", label: "Idiomas" },
                    { key: "showProjects", label: "Proyectos" },
                    { key: "showCertifications", label: "Certificaciones" },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={settings[item.key as keyof typeof settings] as boolean}
                        onChange={(e) => updateSetting(item.key, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              Guardar configuración
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export interface TemplateOption {
  id: string;
  name: string;
  img: string;
}

export const templateOptions: TemplateOption[] = [
  { id: "harvard", name: "Harvard", img: "/templates/template-0.png" },
  { id: "modern", name: "Moderno", img: "/templates/template-1.png" },
  { id: "classic", name: "Clásico", img: "/templates/template-2.png" },
  { id: "creative", name: "Creativo", img: "/templates/template-3.png" },
  { id: "minimal", name: "Minimal", img: "/templates/template-4.png" },
  { id: "professional", name: "Profesional", img: "/templates/template-5.png" },
  { id: "layout6", name: "Elegante", img: "/templates/template-6.jpg" },
];

const TEMPLATE_ALIASES: Record<string, string> = {
  elegant: "layout6",
};

export const TEMPLATE_PALETTES: Record<string, string[]> = {
  harvard: ["#000000"],
  modern: ["#1a365d", "#3B82F6", "#f6aad1"],
  classic: ["#3B82F6", "#34495E", "#2A4365", "#6F7072", "#AF815E", "#F3F2E3"],
  creative: ["#2A4365"],
  minimal: ["#000000"],
  professional: ["#4d4d4d"],
  layout6: ["#000000"],
};

export const resolveTemplateId = (templateId?: string): string => {
  if (!templateId) return "harvard";
  return TEMPLATE_ALIASES[templateId] || templateId;
};

export const getTemplatePalette = (templateId?: string): string[] => {
  const resolved = resolveTemplateId(templateId);
  return TEMPLATE_PALETTES[resolved] || TEMPLATE_PALETTES.harvard;
};

export const getTemplateDefaultColor = (templateId?: string): string => {
  const palette = getTemplatePalette(templateId);
  return palette[0] || "#000000";
};

export const sanitizeTemplatePrimaryColor = (
  templateId: string | undefined,
  requestedColor: string | undefined,
): string => {
  const palette = getTemplatePalette(templateId);
  if (!requestedColor) return getTemplateDefaultColor(templateId);

  const normalized = requestedColor.toLowerCase();
  const allowed = palette.some((color) => color.toLowerCase() === normalized);
  return allowed ? requestedColor : getTemplateDefaultColor(templateId);
};

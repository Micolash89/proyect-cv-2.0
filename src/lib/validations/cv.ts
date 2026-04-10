import { z } from "zod";
import type { CVStatus, TemplateSettings, TemplateType } from "@/types";

const nameRegex = /^[a-zA-Z\u00C0-\u024F\s'-]+$/;
const phoneRegex = /^[0-9+()\s-]+$/;

const STATUS_VALUES: [CVStatus, ...CVStatus[]] = ["pending", "reviewed", "completed"];
const TEMPLATE_VALUES: [TemplateType, ...TemplateType[]] = [
  "harvard",
  "modern",
  "classic",
  "creative",
  "minimal",
  "professional",
  "layout6",
  "elegant",
];

function toDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function isFutureDate(value: string): boolean {
  const date = toDate(value);
  if (!date) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date > today;
}

function hasValue(value?: string): boolean {
  return Boolean(value && value.trim().length > 0);
}

function optionalTextField(
  label: string,
  minLength: number,
  maxLength: number,
): z.ZodString {
  return z
    .string()
    .trim()
    .max(maxLength, `${label}: puede contener hasta ${maxLength} caracteres`)
    .refine(
      (value) => value.length === 0 || value.length >= minLength,
      `${label}: debe tener al menos ${minLength} caracteres`,
    );
}

const experienceSchema = z
  .object({
    id: z.string().min(1, "Experiencia: ID inválido"),
    company: optionalTextField("Empresa", 2, 80),
    position: optionalTextField("Puesto", 2, 80),
    startDate: z.string().trim(),
    endDate: z.string().trim().optional(),
    current: z.boolean().default(false),
    description: optionalTextField("Descripción", 10, 1000),
    provincia: optionalTextField("Provincia", 2, 40).optional(),
    municipio: optionalTextField("Municipio", 2, 40).optional(),
    localidad: optionalTextField("Localidad", 2, 40).optional(),
  })
  .superRefine((value, ctx) => {
    const effectiveEndDate = value.current ? "" : (value.endDate ?? "");

    if (!hasValue(value.company)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["company"],
        message: "Empresa: es obligatoria si agregás experiencia",
      });
    }

    if (!hasValue(value.position)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["position"],
        message: "Puesto: es obligatorio si agregás experiencia",
      });
    }

    if (!hasValue(value.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Fecha desde: es obligatoria",
      });
    }

    if (hasValue(value.startDate) && isFutureDate(value.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Fecha desde: no puede ser posterior a hoy",
      });
    }

    if (hasValue(effectiveEndDate) && isFutureDate(effectiveEndDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Fecha hasta: no puede ser posterior a hoy",
      });
    }

    const startDate = toDate(value.startDate);
    const endDate = toDate(effectiveEndDate);

    if (startDate && endDate && startDate > endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Fecha hasta: debe ser posterior o igual a desde",
      });
    }
  });

const educationSchema = z
  .object({
    id: z.string().min(1, "Educación: ID inválido"),
    institution: optionalTextField("Institución", 2, 80),
    degree: optionalTextField("Título/Carrera", 2, 80),
    startDate: z.string().trim(),
    endDate: z.string().trim().optional(),
    current: z.boolean().default(false),
    provincia: optionalTextField("Provincia", 2, 40).optional(),
    municipio: optionalTextField("Municipio", 2, 40).optional(),
    localidad: optionalTextField("Localidad", 2, 40).optional(),
  })
  .superRefine((value, ctx) => {
    const effectiveEndDate = value.current ? "" : (value.endDate ?? "");

    if (!hasValue(value.institution)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["institution"],
        message: "Institución: es obligatoria si agregás educación",
      });
    }

    if (!hasValue(value.degree)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["degree"],
        message: "Título/Carrera: es obligatorio si agregás educación",
      });
    }

    if (!hasValue(value.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Fecha desde: es obligatoria",
      });
    }

    if (hasValue(value.startDate) && isFutureDate(value.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: "Fecha desde: no puede ser posterior a hoy",
      });
    }

    const startDate = toDate(value.startDate);
    const endDate = toDate(effectiveEndDate);

    if (startDate && endDate && startDate > endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "Fecha hasta: debe ser posterior o igual a desde",
      });
    }
  });

const languageSchema = z.object({
  id: z.string().min(1, "Idioma: ID inválido"),
  language: optionalTextField("Idioma", 2, 30),
  level: z
    .string()
    .trim()
    .min(2, "Nivel: es obligatorio")
    .max(20, "Nivel: puede contener hasta 20 caracteres"),
});

const templateSettingsSchema: z.ZodType<TemplateSettings> = z.object({
  primaryColor: z
    .string()
    .trim()
    .min(4, "Color: inválido")
    .max(20, "Color: inválido"),
  headerBackground: z.string().optional(),
  fontSize: z.enum(["small", "medium", "large"]),
  headerFontSize: z.number().optional(),
  bodyFontSize: z.number().optional(),
  fontFamily: z.string().trim().min(2).max(60),
  layout: z.enum(["ascending", "descending"]),
  padding: z.number().min(10).max(80),
  margin: z.number().min(0).max(80),
  headerPadding: z.number().optional(),
  bodyPadding: z.number().optional(),
  showPhoto: z.boolean().optional(),
  showSummary: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showLanguages: z.boolean().optional(),
  showProjects: z.boolean().optional(),
  showCertifications: z.boolean().optional(),
  fullName: z.boolean().optional(),
  spaceBetween: z.boolean().optional(),
  reverseExperience: z.boolean().optional(),
  reverseEducation: z.boolean().optional(),
  reverseCourses: z.boolean().optional(),
});

export const cvFormValidationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nombre: debe tener al menos 2 caracteres")
      .max(25, "Nombre: puede contener hasta 25 caracteres")
      .regex(nameRegex, "Nombre: solo se permiten letras y espacios"),
    lastName: z
      .string()
      .trim()
      .min(2, "Apellido: debe tener al menos 2 caracteres")
      .max(25, "Apellido: puede contener hasta 25 caracteres")
      .regex(nameRegex, "Apellido: solo se permiten letras y espacios"),
    fullName: z.string().trim().optional(),
    phone: z
      .string()
      .trim()
      .min(6, "Teléfono: debe tener al menos 6 caracteres")
      .max(20, "Teléfono: puede contener hasta 20 caracteres")
      .regex(phoneRegex, "Teléfono: solo se permiten números, espacios y +"),
    email: z.union([
      z.literal(""),
      z.string().trim().email("Email: debe ser válido").max(80),
    ]),
    dni: z
      .string()
      .trim()
      .regex(/^$|^[0-9]{7,8}$/, "DNI: debe contener 7 u 8 números")
      .optional(),
    location: optionalTextField("Ubicación", 2, 80).optional(),
    links: optionalTextField("Links", 5, 400).optional(),
    photo: z.string().trim().optional(),
    summary: optionalTextField("Resumen", 10, 1000).optional(),
    targetJob: optionalTextField("Puesto aspirado", 2, 120).optional(),
    experience: z.array(experienceSchema).default([]),
    education: z.array(educationSchema).default([]),
    skills: z
      .array(optionalTextField("Habilidad", 2, 50))
      .default([]),
    languages: z.array(languageSchema).default([]),
    selectedTemplate: z.enum(TEMPLATE_VALUES),
    templateSettings: templateSettingsSchema,
    status: z.enum(STATUS_VALUES).optional(),
    viewed: z.boolean().optional(),
  })
  .transform((value) => ({
    ...value,
    fullName: buildFullName(value.name, value.lastName),
  }));

export type CVValidatedPayload = z.infer<typeof cvFormValidationSchema>;

export function splitFullName(fullName?: string): { name: string; lastName: string } {
  if (!fullName) {
    return { name: "", lastName: "" };
  }

  const normalized = fullName.trim().replace(/\s+/g, " ");
  if (!normalized) {
    return { name: "", lastName: "" };
  }

  const [name, ...rest] = normalized.split(" ");
  return {
    name: name ?? "",
    lastName: rest.join(" "),
  };
}

export function buildFullName(name?: string, lastName?: string): string {
  return [name?.trim() ?? "", lastName?.trim() ?? ""]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function normalizeCVPayload<T extends Record<string, unknown>>(payload: T): T & { name: string; lastName: string; fullName: string } {
  const nameValue = typeof payload.name === "string" ? payload.name.trim() : "";
  const lastNameValue = typeof payload.lastName === "string" ? payload.lastName.trim() : "";

  if (nameValue && lastNameValue) {
    return {
      ...payload,
      name: nameValue,
      lastName: lastNameValue,
      fullName: buildFullName(nameValue, lastNameValue),
    };
  }

  const { name, lastName } = splitFullName(
    typeof payload.fullName === "string" ? payload.fullName : "",
  );

  return {
    ...payload,
    name,
    lastName,
    fullName: buildFullName(name, lastName),
  };
}

export function toErrorMap(error: z.ZodError): Record<string, string> {
  const mapped: Record<string, string> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!mapped[key]) {
      mapped[key] = issue.message;
    }
  }

  return mapped;
}

export function validateCVPayload(payload: unknown): { success: true; data: CVValidatedPayload } | { success: false; errors: Record<string, string> } {
  const normalized = normalizeCVPayload(payload as Record<string, unknown>);
  const result = cvFormValidationSchema.safeParse(normalized);

  if (!result.success) {
    return {
      success: false,
      errors: toErrorMap(result.error),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

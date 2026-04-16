import { z } from "zod";
import type { AvailabilityType, Certification, CVStatus, TemplateSettings, TemplateType } from "@/types";

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
const AVAILABILITY_VALUES: [AvailabilityType, ...AvailabilityType[]] = ["fullTime", "partTime"];
const MONTH_VALUES = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"] as const;

const MONTH_LABELS: Record<string, string> = {
  "01": "Enero",
  "02": "Febrero",
  "03": "Marzo",
  "04": "Abril",
  "05": "Mayo",
  "06": "Junio",
  "07": "Julio",
  "08": "Agosto",
  "09": "Septiembre",
  "10": "Octubre",
  "11": "Noviembre",
  "12": "Diciembre",
};

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

function parseMonthYearFromDate(value?: string): { startMonth?: string; startYear?: string } {
  if (!value) {
    return {};
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return {};
  }

  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  return {
    startMonth: MONTH_LABELS[month] ? month : undefined,
    startYear: String(parsed.getFullYear()),
  };
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

function normalizeCertificationField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCertificationInput(certification: Record<string, unknown>): Record<string, unknown> {
  return {
    ...certification,
    title: normalizeCertificationField(certification.title ?? certification.name),
    institution: normalizeCertificationField(certification.institution ?? certification.issuer),
    startMonth: normalizeCertificationField(certification.startMonth),
    startYear: normalizeCertificationField(certification.startYear),
    name: normalizeCertificationField(certification.name),
    issuer: normalizeCertificationField(certification.issuer),
    date: normalizeCertificationField(certification.date),
  };
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

const certificationSchema = z
  .object({
    id: z.string().min(1, "Curso: ID inválido"),
    title: optionalTextField("Título del curso", 1, 120).optional(),
    institution: optionalTextField("Institución", 1, 120).optional(),
    startMonth: z.enum(MONTH_VALUES).or(z.literal("")).optional(),
    startYear: z
      .string()
      .trim()
      .regex(/^$|^[0-9]{4}$/, "Año de inicio: debe tener 4 dígitos")
      .optional(),
    name: optionalTextField("Título del curso", 1, 120).optional(),
    issuer: optionalTextField("Institución", 1, 120).optional(),
    date: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    const title = value.title ?? value.name ?? "";
    const institution = value.institution ?? value.issuer ?? "";
    const derivedDate = value.date ? parseMonthYearFromDate(value.date) : {};
    const startMonth = value.startMonth ?? derivedDate.startMonth;
    const startYear = value.startYear ?? derivedDate.startYear;
    const hasLegacyDate = hasValue(value.date);

    if (!hasValue(title)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["title"],
        message: "Título del curso: es obligatorio",
      });
    }

    if (hasValue(startMonth) && !MONTH_VALUES.includes(startMonth as typeof MONTH_VALUES[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startMonth"],
        message: "Mes de inicio: es inválido",
      });
    }

    if (hasValue(startYear) && !/^\d{4}$/.test(startYear ?? "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startYear"],
        message: "Año de inicio: debe tener 4 dígitos",
      });
    }

    if (!hasValue(institution) && value.issuer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["institution"],
        message: "Institución: es inválida",
      });
    }
  });

const templateSettingsSchema: z.ZodType<TemplateSettings> = z.object({
  primaryColor: z
    .string()
    .trim()
    .min(4, "Color: inválido")
    .max(20, "Color: inválido"),
  headerBackground: z.string().trim().max(20).optional(),
  headerFontSize: z.number().int().min(12).max(60).optional(),
  bodyFontSize: z.number().int().min(7).max(24).optional(),
  fontFamily: z.string().trim().max(50).optional(),
  layout: z.enum(["ascending", "descending"] as const).optional(),
  padding: z.number().int().min(0).max(80).optional(),
  margin: z.number().int().min(0).max(80).optional(),
  headerPadding: z.number().int().min(0).max(80).optional(),
  bodyPadding: z.number().int().min(0).max(80).optional(),
  showPhoto: z.boolean().optional(),
  showSummary: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showLanguages: z.boolean().optional(),
  showCertifications: z.boolean().optional(),
  showOrientation: z.boolean().optional(),
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
      .regex(nameRegex, "Nombre: solo se permiten letras y espacios")
      .transform((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()),
    lastName: z
      .string()
      .trim()
      .min(2, "Apellido: debe tener al menos 2 caracteres")
      .max(25, "Apellido: puede contener hasta 25 caracteres")
      .regex(nameRegex, "Apellido: solo se permiten letras y espacios")
      .transform((val) => val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()),
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
    fechaNacimiento: z
      .string()
      .trim()
      .regex(/^$|^\d{4}-\d{2}-\d{2}$/, "Fecha de nacimiento: formato inválido")
      .refine((value) => !hasValue(value) || !isFutureDate(value), "Fecha de nacimiento: no puede ser posterior a hoy")
      .optional(),
    location: optionalTextField("Ubicación", 2, 80).optional(),
    links: optionalTextField("Links", 5, 400).optional(),
    photo: z.string().trim().optional(),
    summary: optionalTextField("Resumen", 10, 1000).optional(),
    targetJob: optionalTextField("Puesto aspirado", 2, 120).optional(),
    licencia: optionalTextField("Licencia de conducir", 2, 30).optional(),
    movilidad: z.boolean().optional(),
    incorporacionInmediata: z.boolean().optional(),
    disponibilidad: z.string().trim().optional(),
    office: z.boolean().optional(),
    experience: z.array(experienceSchema).default([]),
    education: z.array(educationSchema).default([]),
    skills: z
      .array(optionalTextField("Habilidad", 2, 50))
      .default([]),
    languages: z.array(languageSchema).default([]),
    certifications: z.array(certificationSchema).default([]),
    selectedTemplate: z.enum(TEMPLATE_VALUES),
    templateSettings: templateSettingsSchema,
    status: z.enum(STATUS_VALUES).optional(),
    viewed: z.boolean().optional(),
  })
  .transform((value) => ({
    ...value,
    fullName: buildFullName(value.name, value.lastName),
    certifications: value.certifications.map((cert) => {
      const derivedDate = cert.date ? parseMonthYearFromDate(cert.date) : {};
      const title = cert.title ?? cert.name ?? "";
      const institution = cert.institution ?? cert.issuer;

      return {
        id: cert.id,
        title,
        institution,
        startMonth: cert.startMonth ?? derivedDate.startMonth ?? "",
        startYear: cert.startYear ?? derivedDate.startYear ?? "",
        name: cert.name,
        issuer: cert.issuer,
        date: cert.date,
      } satisfies Certification;
    }),
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

function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function buildFullName(name?: string, lastName?: string): string {
  const normalizedName = capitalizeFirst(name?.trim() ?? "");
  const normalizedLastName = capitalizeFirst(lastName?.trim() ?? "");
  return [normalizedName, normalizedLastName]
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function normalizeCVPayload<T extends Record<string, unknown>>(payload: T): T & { name: string; lastName: string; fullName: string } {
  const nameValue = typeof payload.name === "string" ? payload.name.trim() : "";
  const lastNameValue = typeof payload.lastName === "string" ? payload.lastName.trim() : "";
  const certifications = Array.isArray(payload.certifications)
    ? payload.certifications.map((item) =>
        normalizeCertificationInput((item ?? {}) as Record<string, unknown>),
      )
    : payload.certifications;

  if (nameValue && lastNameValue) {
    return {
      ...payload,
      certifications,
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
    certifications,
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

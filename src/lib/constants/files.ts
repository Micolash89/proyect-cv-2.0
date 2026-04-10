export const MAX_IMAGE_SIZE_BYTES = 1 * 1024 * 1024;

export const CV_IMPORT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const CV_IMPORT_ACCEPT = ".pdf,image/jpeg,image/png,image/webp";

export const FILE_ERROR_MESSAGES = {
  imageOnly: "El archivo debe ser una imagen",
  imageTooLarge: "La imagen debe ser menor a 1MB",
  invalidCVType: "Tipo de archivo no válido. Solo PDF, JPEG, PNG o WebP",
} as const;

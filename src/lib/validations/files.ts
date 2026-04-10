import { FILE_ERROR_MESSAGES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/files";

type FileCandidate = Pick<File, "type" | "size"> | null | undefined;

export type FileValidationResult =
  | { success: true }
  | { success: false; error: string };

export function validateImageFile(file: FileCandidate): FileValidationResult {
  if (!file?.type.startsWith("image/")) {
    return { success: false, error: FILE_ERROR_MESSAGES.imageOnly };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return { success: false, error: FILE_ERROR_MESSAGES.imageTooLarge };
  }

  return { success: true };
}

export const AUTH_COOKIE_NAME = "cv-admin-token";
export const AUTH_TOKEN_EXPIRATION = "7d";
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: "Credenciales inválidas",
  internalServerError: "Error interno del servidor",
  validationFailed: "Validation failed",
} as const;

/**
 * Tipos para el flujo de cambio de correo electrónico.
 * El endpoint recibe el nuevo email y la contraseña actual como verificación de identidad.
 */
export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword: string;
}

export interface ChangeEmailResponse {
  message: string;
}

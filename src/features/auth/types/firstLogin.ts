export interface FirstLoginRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  dni: number;
  country: string;
}

export interface FirstLoginResponse {
  message: string;
}

import { api } from "../../../lib/api";
import { ForgotPasswordFormData } from "../schemas/forgotPasswordSchema";
import type { LoginFormData } from "../schemas/loginSchema";
import type { RegisterFormData } from "../schemas/registerSchema";
import { ResetPasswordFormData } from "../schemas/resetPasswordSchema";

export interface AuthResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  token: string;
  mustChangePassword: boolean;
}

export const AuthService = {
    
    login: async (credentials: LoginFormData): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>("/api/auth", credentials);
        return response.data;
    },

    register: async (userData: RegisterFormData): Promise<void> => {
        // Transformamos los datos para que coincidan con UserRequestDTO
        const payload = {
        ...userData,
        dni: parseInt(userData.dni, 10), // El form envía un string, el backend exige un integer
        };

        // Enviamos el payload completo (incluyendo confirmPassword)
        await api.post("/api/users", payload); 
    },

    /**
     * Solicita el envío del correo de recuperación.
     */
    forgotPassword: async (data: ForgotPasswordFormData): Promise<void> => {
        await api.post("/api/auth/forgot-password", data);
    },

    /**
     * Envía la nueva contraseña junto con el token recibido por email.
     */
    resetPassword: async (token: string, data: ResetPasswordFormData): Promise<void> => {
        // Combinamos el token de la URL con las contraseñas del formulario
        const payload = {
        token,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
        };
        await api.patch("/api/auth/reset-password", payload); // Ajustá esta URL si es distinta
    },
};
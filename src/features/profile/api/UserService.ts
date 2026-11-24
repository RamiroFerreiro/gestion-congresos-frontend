import { api } from "../../../lib/api";
import type {
  UserProfileResponse,
  UpdateUserProfileRequest,
} from "../types/userProfile";
import type {
  ChangeEmailRequest,
  ChangeEmailResponse,
} from "../types/changeEmail";
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../types/changePassword";

export const UserService = {
  /**
   * Obtiene la información del perfil del usuario actualmente autenticado.
   */
  getMe: async (signal?: AbortSignal): Promise<UserProfileResponse> => {
    const response = await api.get<UserProfileResponse>("/api/users/me", {
      signal,
    });
    return response.data;
  },

  /**
   * Actualiza los datos personales globales del usuario.
   * Requiere el userCode del usuario objetivo y el payload con los campos modificables.
   */
  updateUser: async (
    userCode: string,
    payload: UpdateUserProfileRequest,
  ): Promise<UserProfileResponse> => {
    const response = await api.put<UserProfileResponse>(
      `/api/users/${encodeURIComponent(userCode)}`,
      payload,
    );
    return response.data;
  },

  /**
   * Inicia el flujo de cambio de correo electrónico con doble confirmación.
   * El backend envía un enlace al correo actual del usuario para verificar la solicitud.
   */
  changeEmail: async (
    payload: ChangeEmailRequest,
  ): Promise<ChangeEmailResponse> => {
    const response = await api.patch<ChangeEmailResponse>(
      "/api/users/change-email",
      payload,
    );
    return response.data;
  },

  /**
   * Cambia voluntariamente la contraseña del usuario actualmente autenticado.
   */
  changePassword: async (
    payload: ChangePasswordRequest,
  ): Promise<ChangePasswordResponse> => {
    const response = await api.patch<ChangePasswordResponse>(
      "/api/users/change-password",
      payload,
    );
    return response.data;
  },
};

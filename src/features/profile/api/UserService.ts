import { api } from "../../../lib/api";
import type {
  UserProfileResponse,
  UpdateUserProfileRequest,
} from "../types/userProfile";

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
};

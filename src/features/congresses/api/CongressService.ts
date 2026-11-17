import { api } from "../../../lib/api";
import type {
  Congress,
  CongressRole,
  CreateCongressRequest,
  UpdateCongressRequest,
  AvailableCongress,
  CongressParticipation,
  CongressMessage,
} from "../types/congress";

class CongressService {
  listCongresses(enabled?: boolean) {
    return api.get<AvailableCongress[]>("/api/congresses", {
      params: enabled !== undefined ? { enabled } : undefined,
    });
  }

  getMyParticipation(congressCode: string, signal?: AbortSignal) {
    return api.get<CongressParticipation>(
      `/api/congresses/${encodeURIComponent(congressCode)}/participants/me`,
      { signal },
    );
  }

  registerMe(congressCode: string, institution: string) {
    return api.post<CongressMessage>(
      `/api/congresses/${encodeURIComponent(congressCode)}/participants/me`,
      { institution },
    );
  }

  updateMyInstitution(congressCode: string, institution: string) {
    return api.patch<CongressMessage>(
      `/api/congresses/${encodeURIComponent(congressCode)}/participants/me/institution`,
      { institution },
    );
  }

  getCongressById(congressId: number) {
    return api.get<Congress>(`/api/congresses/${congressId}`);
  }

  createCongress(payload: CreateCongressRequest) {
    return api.post<Congress>("/api/congresses", payload);
  }

  disableCongress(congressId: number) {
    return api.patch<void>(`/api/congresses/${congressId}/disable`);
  }

  enableCongress(congressId: number) {
    return api.patch<void>(`/api/congresses/${congressId}/enable`);
  }

  updateCongress(congressId: number, payload: UpdateCongressRequest) {
    return api.put<Congress>(`/api/congresses/${congressId}`, payload);
  }

  listParticipantsByCongressAndRole(congressId: number, role?: CongressRole) {
    return api.get(`/api/congresses/${congressId}/participants`, {
      params: role ? { role } : undefined,
    });
  }

  addParticipantToCongress(congressId: number, participantId: number) {
    return api.post<void>(
      `/api/congresses/${congressId}/participants/${participantId}`,
    );
  }

  getCongressByCode(congressCode: string, signal?: AbortSignal) {
    return api.get<{
      congressId: number;
      code: string;
      name: string;
      place: string;
      thematicAreas: string[];
      enabled: boolean;
      isFree: boolean;
      isSingleBlind: boolean;
      contactMail: string;
    }>(`/api/congresses/${encodeURIComponent(congressCode)}`, { signal });
  }
}

export default new CongressService();

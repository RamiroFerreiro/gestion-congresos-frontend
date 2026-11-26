import { api } from "../../../lib/api";
import type { CreatedCongress } from "../types/createCongress";
import type { CongressDashboard } from "../types/congressDashboard";
import type {
  Congress,
  CongressRole,
  CreateCongressRequest,
  UpdateCongressRequest,
  AvailableCongress,
  CongressParticipation,
  CongressMessage,
  MyCongressSummary,
  CongressDetails,
} from "../types/congress";

class CongressService {
  listCongresses(enabled?: boolean) {
    return api.get<AvailableCongress[]>("/api/congresses", {
      params: enabled !== undefined ? { enabled } : undefined,
    });
  }

  listMyCongresses(signal?: AbortSignal) {
    return api.get<MyCongressSummary[]>("/api/congresses/mine", { signal });
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
    return api.post<CreatedCongress>("/api/congresses", payload);
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
    return api.get<CongressDetails>(
      `/api/congresses/${encodeURIComponent(congressCode)}`,
      { signal },
    );
  }

  getDashboard(congressCode: string, signal?: AbortSignal) {
    return api.get<CongressDashboard>(
      `/api/congresses/${encodeURIComponent(congressCode)}/dashboard`,
      { signal },
    );
  }
}

export default new CongressService();

import { api } from "../../../lib/api";
import type {
  Congress,
  CongressRole,
  CreateCongressRequest,
  UpdateCongressRequest,
} from "../types/congress";

class CongressService {
  listCongresses(enabled?: boolean) {
    return api.get<Congress[]>("/api/congresses", {
      params: enabled !== undefined ? { enabled } : undefined,
    });
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

  updateCongress(
    congressId: number,
    payload: UpdateCongressRequest,
  ) {
    return api.put<Congress>(
      `/api/congresses/${congressId}`,
      payload,
    );
  }

  listParticipantsByCongressAndRole(
    congressId: number,
    role?: CongressRole,
  ) {
    return api.get(`/api/congresses/${congressId}/participants`, {
      params: role ? { role } : undefined,
    });
  }

  addParticipantToCongress(
    congressId: number,
    participantId: number,
  ) {
    return api.post<void>(
      `/api/congresses/${congressId}/participants/${participantId}`,
    );
  }
}

export default new CongressService();
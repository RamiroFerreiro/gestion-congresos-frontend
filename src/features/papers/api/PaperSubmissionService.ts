import { api } from "../../../lib/api";
import type { CongressParticipation } from "../../congresses/types/congress";
import type {
  CreatePaperRequest,
  PaperCongressRules,
  PaperDetail,
  UpdatePaperRequest,
} from "../types/paperSubmission";

const congressPath = (code: string) =>
  `/api/congresses/${encodeURIComponent(code)}`;
const paperPath = (code: string) => `/api/papers/${encodeURIComponent(code)}`;

export const PaperSubmissionService = {
  async getCongressRules(congressCode: string, signal?: AbortSignal) {
    return (
      await api.get<PaperCongressRules>(congressPath(congressCode), { signal })
    ).data;
  },

  async getMyParticipation(congressCode: string, signal?: AbortSignal) {
    return (
      await api.get<CongressParticipation>(
        `${congressPath(congressCode)}/participants/me`,
        { signal },
      )
    ).data;
  },

  async getPaper(paperCode: string, signal?: AbortSignal) {
    return (await api.get<PaperDetail>(paperPath(paperCode), { signal })).data;
  },

  async createPaper(payload: CreatePaperRequest) {
    return (await api.post<PaperDetail>("/api/papers", payload)).data;
  },

  async updatePaper(paperCode: string, payload: UpdatePaperRequest) {
    return (await api.put<PaperDetail>(paperPath(paperCode), payload)).data;
  },

  async addKeyword(paperCode: string, keyword: string) {
    return (
      await api.post<string[]>(`${paperPath(paperCode)}/keywords`, undefined, {
        params: { keyword },
      })
    ).data;
  },

  async removeKeyword(paperCode: string, keyword: string) {
    return (
      await api.delete<string[]>(`${paperPath(paperCode)}/keywords`, {
        params: { keyword },
      })
    ).data;
  },

  async removeAuthor(paperCode: string, userCode: string) {
    return (
      await api.delete<PaperDetail["authors"]>(
        `${paperPath(paperCode)}/authors/${encodeURIComponent(userCode)}`,
      )
    ).data;
  },

  async submitPaper(paperCode: string, confirmDiscardPendingRequests = false) {
    return (
      await api.patch<PaperDetail>(
        `${paperPath(paperCode)}/submit`,
        undefined,
        {
          params: confirmDiscardPendingRequests
            ? { confirmDiscardPendingRequests: true }
            : undefined,
        },
      )
    ).data;
  },
};

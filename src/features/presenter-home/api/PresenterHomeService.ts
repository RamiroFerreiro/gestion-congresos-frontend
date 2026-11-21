import { api } from "../../../lib/api";
import type { PresenterHomeSummary } from "../types/presenterHome";

const participantHomePath = (congressCode: string) =>
  `/api/congresses/${encodeURIComponent(congressCode)}/participant-home`;

export const PresenterHomeService = {
  async getSummary(congressCode: string, signal?: AbortSignal) {
    return (
      await api.get<PresenterHomeSummary>(participantHomePath(congressCode), {
        signal,
      })
    ).data;
  },
};

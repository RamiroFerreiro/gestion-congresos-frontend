import { api } from "../../../lib/api";
import type {
  ParticipantPaperInboxPage,
  ParticipantPaperInboxParams,
} from "../types/participantPaperInbox";

const inboxPath = (congressCode: string) =>
  `/api/papers/congresses/${encodeURIComponent(congressCode)}/mine`;

export const ParticipantPaperInboxService = {
  async getMyPapers(
    congressCode: string,
    params: ParticipantPaperInboxParams,
    signal?: AbortSignal,
  ) {
    return (
      await api.get<ParticipantPaperInboxPage>(inboxPath(congressCode), {
        params,
        signal,
      })
    ).data;
  },
};

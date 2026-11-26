import { api } from "../../../lib/api";
import type {
  ReviewerInbox,
  ReviewerInboxStatus,
} from "../types/reviewerInbox";

export const ReviewerInboxService = {
  async getMyInbox(
    congressCode: string,
    status: ReviewerInboxStatus | "",
    signal?: AbortSignal,
  ) {
    return (
      await api.get<ReviewerInbox>(
        `/api/papers/congresses/${encodeURIComponent(congressCode)}/reviewer-inbox`,
        { params: status ? { status } : undefined, signal },
      )
    ).data;
  },
};

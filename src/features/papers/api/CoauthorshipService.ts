import { api } from "../../../lib/api";
import type {
  CoauthorshipCatalog,
  CoauthorshipRequest,
} from "../types/coauthorship";

const requestsPath = (paperCode: string) =>
  `/api/papers/${encodeURIComponent(paperCode)}/authors/requests`;

export const CoauthorshipService = {
  async getCatalog(
    congressCode: string,
    search: string,
    page: number,
    signal?: AbortSignal,
  ) {
    return (
      await api.get<CoauthorshipCatalog>(
        `/api/papers/congresses/${encodeURIComponent(congressCode)}`,
        {
          params: {
            forCoauthorship: true,
            search: search.trim() || undefined,
            page,
            size: 10,
            sort: "code,asc",
          },
          signal,
        },
      )
    ).data;
  },
  async request(paperCode: string, userCode: string) {
    return (
      await api.post<CoauthorshipRequest>(
        `${requestsPath(paperCode)}/${encodeURIComponent(userCode)}`,
      )
    ).data;
  },
  async getPending(paperCode: string, signal?: AbortSignal) {
    return (
      await api.get<CoauthorshipRequest[]>(
        `${requestsPath(paperCode)}/pending`,
        { signal },
      )
    ).data;
  },
  async decide(
    paperCode: string,
    userCode: string,
    decision: "accept" | "reject",
  ) {
    return (
      await api.patch<CoauthorshipRequest[]>(
        `${requestsPath(paperCode)}/${encodeURIComponent(userCode)}/${decision}`,
      )
    ).data;
  },
};

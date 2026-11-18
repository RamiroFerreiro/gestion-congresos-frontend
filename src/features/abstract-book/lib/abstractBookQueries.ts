import { queryOptions } from "@tanstack/react-query";
import { AbstractBookService } from "../api/AbstractBookService";

export const abstractBookKey = (userId: number, congressCode: string) =>
  ["abstract-book-papers", userId, congressCode] as const;

export const abstractBookOptions = (userId: number, congressCode: string) =>
  queryOptions({
    queryKey: abstractBookKey(userId, congressCode),
    queryFn: ({ signal }) =>
      AbstractBookService.getPapers(congressCode, signal),
    retry: false,
    staleTime: 15_000,
  });

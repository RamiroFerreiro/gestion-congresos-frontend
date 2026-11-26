import type { QueryClient } from "@tanstack/react-query";

export async function invalidateCoauthorshipQueries(
  client: QueryClient,
  userId: number,
  congressCode: string,
  paperCode: string,
) {
  const keys = [
    ["coauthorship-catalog", userId, congressCode],
    ["paper-author-requests", userId, congressCode, paperCode],
    ["paper-detail", userId, paperCode],
    ["paper-submission-paper", userId, paperCode],
    ["participant-paper-inbox", userId, congressCode],
    ["presenter-home", userId, congressCode],
    ["paper-submission-participation", userId, congressCode],
  ];
  await Promise.all(
    keys.map((queryKey) => client.invalidateQueries({ queryKey })),
  );
}

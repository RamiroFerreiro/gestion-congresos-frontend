import type { PageResponse } from "./paper";

export interface CoauthorshipPaper {
  code: string;
  title: string;
  thematicArea: string;
  acceptedAuthorCount: number;
  maxNumberOfAuthors: number | null;
}

export type CoauthorshipCatalog = PageResponse<CoauthorshipPaper>;

export interface CoauthorshipRequest {
  userCode: string;
  fullName: string;
  email: string;
  institution: string;
  paperCode: string;
  status: "PENDING" | "ACCEPTED";
}

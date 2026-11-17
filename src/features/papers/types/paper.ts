
///-----------------------------------------------TABLA DE PAPERS PARA ADMIN------------------------------------------------
export type PaperStatus =
  | "NOT_SUBMITTED"
  | "UNDER_EVALUATION"
  | "ACCEPTED"
  | "REJECTED"
  | "NEEDS_REVISION";

export interface PaperSummary {
  code: string;
  title: string;
  thematicArea: string;
  version: string;
  congressPaperType: string;
  status: PaperStatus;
  reviewerName: string | null;
  pay: boolean;
  submittedAt: string;
}

export interface PaperFilterParams {
  status?: PaperStatus | "";
  unassigned?: boolean | "";
  pay?: boolean | "";
  thematicArea?: string;
  search?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // índice base 0
  first: boolean;
  last: boolean;
  empty: boolean;
}
///----------------------------------------------------------------------------------------------------------------------

export interface Paper {
  id: number;
  title: string;
  status: string;
}

export interface CreatePaperRequest {
  title: string;
}
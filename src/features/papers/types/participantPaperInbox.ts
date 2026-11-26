import type { PaperStatus } from "./paperSubmission";

export type ParticipantPaymentStatus =
  | "NOT_ENABLED"
  | "PENDING_RECEIPT"
  | "PENDING_APPROVAL"
  | "VERIFIED"
  | "REJECTED";

export type ParticipantPaperActivityType =
  | "DRAFT_SAVED"
  | "PAPER_SUBMITTED"
  | "EVALUATION_RELEASED"
  | "CORRECTION_SUBMITTED"
  | "PAYMENT_UPLOADED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_REJECTED";

export interface ParticipantPaperSummary {
  code: string;
  title: string;
  version: string;
  status: PaperStatus;
  submittedAt: string | null;
  responsibleAuthor: boolean;
  paymentStatus: ParticipantPaymentStatus;
  canUploadPayment: boolean;
  lastActivityType: ParticipantPaperActivityType | null;
  lastActivityAt: string | null;
}

export interface ParticipantPaperInboxPage {
  content: ParticipantPaperSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface ParticipantPaperInboxParams {
  status?: PaperStatus;
  page?: number;
  size?: number;
  sort?: string;
}

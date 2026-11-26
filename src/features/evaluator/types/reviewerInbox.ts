export type ReviewerInboxStatus =
  | "REVISION_PENDING"
  | "EVALUATION_PENDING"
  | "PENDING_RELEASE"
  | "NEEDS_REVISION"
  | "ACCEPTED"
  | "REJECTED";

export interface ReviewerInboxPaper {
  code: string;
  title: string;
  thematicArea: string;
  version: string;
  status: ReviewerInboxStatus;
  lastActivity: "ASSIGNED" | "CORRECTION_RECEIVED" | "EVALUATION_ISSUED";
  lastActivityAt: string | null;
}

export interface ReviewerInbox {
  congressCode: string;
  congressName: string;
  totalAssigned: number;
  papers: ReviewerInboxPaper[];
}

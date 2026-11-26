export type PaperStatus =
  | "NOT_SUBMITTED"
  | "UNDER_EVALUATION"
  | "ACCEPTED"
  | "REJECTED"
  | "NEEDS_REVISION";

export type PaperAuthorStatus = "PENDING" | "ACCEPTED";

export interface PaperAuthor {
  userCode: string;
  fullName: string;
  email: string;
  dni: string;
  institution: string;
  country: string;
  authorOrder: number;
  status: PaperAuthorStatus;
  paperCode: string;
  mainAuthor: boolean;
  presentator: boolean;
}

export interface PaperDetail {
  code: string;
  title: string;
  thematicArea: string;
  version: string;
  status: PaperStatus;
  summary: string;
  keywords: string[];
  submittedAt: string | null;
  pay: boolean;
  congressCode: string;
  congressName: string;
  reviewerCode: string | null;
  reviewerFullName: string | null;
  congressPaperTypeName: string;
  authors: PaperAuthor[];
}

export interface PaperEvaluation {
  feedback: string;
  evaluationDate: string;
  evaluatedVersion: string;
  newDeadline: string | null;
  newStatus: PaperStatus;
  evaluatorCode: string | null;
  evaluatorFullName: string | null;
}

export interface PaperCongressRules {
  congressId: number;
  code: string;
  name: string;
  presentationStartDate: string;
  presentationEndDate: string;
  maxNumberOfAuthors: number;
  keywordRepetition: boolean;
  minKeywords: number;
  maxKeywords: number;
  thematicAreas: string[];
  enabled: boolean;
}

export interface CreatePaperRequest {
  title: string;
  thematicArea: string;
  summary: string;
  keywords: string[];
  congressCode: string;
  authorUserCodes: string[];
}

export interface UpdatePaperRequest {
  title: string;
  thematicArea: string;
  summary: string;
}

export interface PaperSubmissionFormValues {
  title: string;
  thematicArea: string;
  keywords: string;
  summary: string;
}

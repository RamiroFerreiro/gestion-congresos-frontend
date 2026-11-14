export type PaymentStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface PaperPayment {
  paperPaymentId: number | null;
  paperCode: string;
  paperTitle: string;
  amountPaid: number | null;
  uploadDate: string | null;
  fileName: string | null;
  observations: string | null;
  status: PaymentStatus | null;
  createdAt: string | null;
  createdBy: string | null;
}

export interface PaymentPaper {
  code: string;
  title: string;
  status: string;
  congressCode: string;
  authors: {
    userCode: string;
    email: string;
    fullName: string;
    mainAuthor: boolean;
    status: string;
  }[];
}

export interface PaymentRecord {
  paper: PaymentPaper;
  payment: PaperPayment;
}

export interface PaymentCongress {
  code: string;
  name: string;
  free: boolean;
}

export interface AcceptedPapersPage {
  content: { code: string; title: string }[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface PaymentReview {
  status: "APPROVED" | "REJECTED";
  observations: string;
}

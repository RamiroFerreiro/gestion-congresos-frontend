export interface PresenterHomeSummary {
  congressCode: string;
  congressName: string;
  place: string;
  presentationEndDate: string;
  totalAssociatedPapers: number;
  drafts: number;
  needsRevision: number;
  underEvaluation: number;
  paymentsWithoutValidReceipt: number;
  paymentsPendingApproval: number;
  paymentsVerified: number;
}

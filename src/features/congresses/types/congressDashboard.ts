export interface DashboardMetric {
  count: number;
  percentage: number;
}

/** Contrato de GET /api/congresses/{congressCode}/dashboard. */
export interface CongressDashboard {
  congressCode: string;
  congressName: string;
  academicMetrics: {
    totalSubmissions: number;
    unassignedSubmissions: DashboardMetric;
    underEvaluationSubmissions: DashboardMetric;
    needsRevisionSubmissions: DashboardMetric;
    acceptedSubmissions: DashboardMetric;
    rejectedSubmissions: DashboardMetric;
    notSubmittedSubmissions: DashboardMetric;
  };
  financialMetrics: {
    totalPayments: number;
    pendingApprovalPayments: DashboardMetric;
    approvedPayments: DashboardMetric;
    rejectedPayments: DashboardMetric;
  };
}

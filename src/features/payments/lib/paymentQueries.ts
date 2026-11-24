import { queryOptions } from "@tanstack/react-query";
import { PaymentService } from "../api/PaymentService";

export const paymentRecordOptions = (
  userId: number,
  congressCode: string,
  paperCode: string,
) =>
  queryOptions({
    queryKey: ["payment-record", userId, congressCode, paperCode],
    queryFn: ({ signal }) =>
      PaymentService.getRecord(congressCode, paperCode, signal),
    retry: false,
  });

import { isAxiosError } from "axios";
import { api } from "../../../lib/api";
import type {
  AcceptedPapersPage,
  PaperPayment,
  PaymentCongress,
  PaymentPaper,
  PaymentRecord,
  PaymentReview,
} from "../types/payment";

const paperPath = (code: string) => `/api/papers/${encodeURIComponent(code)}`;
const paymentPath = (code: string) =>
  `/api/papers/payments/${encodeURIComponent(code)}`;

export const PaymentService = {
  async getCongress(code: string, signal?: AbortSignal) {
    return (
      await api.get<PaymentCongress>(
        `/api/congresses/${encodeURIComponent(code)}`,
        { signal },
      )
    ).data;
  },

  async listAcceptedPapers(
    congressCode: string,
    page: number,
    search: string,
    signal?: AbortSignal,
  ) {
    return (
      await api.get<AcceptedPapersPage>(
        `/api/papers/congresses/${encodeURIComponent(congressCode)}`,
        {
          params: {
            status: "ACCEPTED",
            page,
            size: 10,
            sort: "code,asc",
            search,
          },
          signal,
        },
      )
    ).data;
  },

  async getRecord(
    congressCode: string,
    paperCode: string,
    signal?: AbortSignal,
  ): Promise<PaymentRecord> {
    const paper = (
      await api.get<PaymentPaper>(paperPath(paperCode), { signal })
    ).data;
    if (paper.congressCode !== congressCode) {
      throw new Error("El trabajo no pertenece al congreso seleccionado.");
    }
    try {
      const payment = (
        await api.get<PaperPayment>(paymentPath(paperCode), { signal })
      ).data;
      return { paper, payment };
    } catch (error) {
      if (!isAxiosError(error) || error.response?.status !== 404) throw error;
      // El backend actual devuelve 404 sin comprobante; la consulta previa valida existencia y acceso.
      return {
        paper,
        payment: {
          paperPaymentId: null,
          paperCode: paper.code,
          paperTitle: paper.title,
          amountPaid: null,
          uploadDate: null,
          fileName: null,
          observations: null,
          status: null,
          createdAt: null,
          createdBy: null,
        },
      };
    }
  },

  async upload(paperCode: string, file: File) {
    const data = new FormData();
    data.append("file", file);
    return (
      await api.post<PaperPayment>(`${paperPath(paperCode)}/payment`, data, {
        headers: { "Content-Type": undefined },
      })
    ).data;
  },

  async review(paperCode: string, review: PaymentReview) {
    return (
      await api.patch<PaperPayment>(`${paymentPath(paperCode)}/status`, review)
    ).data;
  },

  async getReceipt(paperCode: string, signal?: AbortSignal) {
    return (
      await api.get<Blob>(
        `/api/papers/payments/file/${encodeURIComponent(paperCode)}`,
        { responseType: "blob", signal },
      )
    ).data;
  },
};

import { isAxiosError } from "axios";
import { api } from "../../../lib/api";
import type { AbstractBookPaper } from "../types/abstractBook";

const bookPath = (code: string) =>
  `/api/congresses/${encodeURIComponent(code)}/abstract-book`;

export function getAbstractBookError(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401)
      return "Tu sesión venció. Volvé a iniciar sesión.";
    if (error.response?.status === 403)
      return "No tenés permisos para consultar o generar el Libro de Resúmenes. Verificá tu rol e institución en el congreso.";
    if (error.response?.status === 404)
      return "No se encontró el congreso o el servicio del Libro de Resúmenes.";
    if (!error.response)
      return "No pudimos conectar con el servidor. Intentá nuevamente.";
    if (typeof error.response.data?.message === "string")
      return error.response.data.message;
  }
  if (error instanceof Error && !isAxiosError(error)) return error.message;
  return "No pudimos obtener el Libro de Resúmenes. Intentá nuevamente.";
}

export const AbstractBookService = {
  async getPapers(congressCode: string, signal?: AbortSignal) {
    return (
      await api.get<AbstractBookPaper[]>(`${bookPath(congressCode)}/papers`, {
        signal,
      })
    ).data;
  },

  async downloadWord(congressCode: string) {
    try {
      const response = await api.get<Blob>(bookPath(congressCode), {
        responseType: "blob",
      });
      if (!response.data.size || response.data.type.includes("json"))
        throw new Error("El servidor no devolvió un documento Word válido.");
      return response.data;
    } catch (error) {
      if (isAxiosError<Blob>(error) && error.response?.data instanceof Blob) {
        let message: unknown;
        try {
          message = (
            JSON.parse(await error.response.data.text()) as {
              message?: unknown;
            }
          ).message;
        } catch {
          message = undefined;
        }
        if (typeof message === "string" && message.trim())
          throw new Error(message);
      }
      throw error;
    }
  },
};

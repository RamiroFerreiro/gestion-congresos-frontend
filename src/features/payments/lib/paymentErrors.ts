import { isAxiosError } from "axios";

export function getPaymentError(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    const status = error.response?.status;
    if (status === 401) return "Tu sesión venció. Volvé a iniciar sesión.";
    if (status === 403)
      return "No tenés permisos para consultar o modificar este pago.";
    if (status === 404)
      return "No se encontró el trabajo o el comprobante solicitado.";
    if (status === 413)
      return "El archivo supera el tamaño permitido por el servidor.";
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (!error.response)
      return "No pudimos conectar con el servidor. Intentá nuevamente.";
  }
  if (error instanceof Error && !isAxiosError(error)) return error.message;
  return "No pudimos completar la operación. Intentá nuevamente.";
}

import { isAxiosError } from "axios";

export function getCongressError(error: unknown): string {
  if (isAxiosError<{ message?: string }>(error)) {
    if (error.response?.status === 401) {
      return "Tu sesión venció. Volvé a iniciar sesión para continuar.";
    }
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
    if (!error.response)
      return "No pudimos conectar con el servidor. Intentá nuevamente.";
    if (error.response.status === 403)
      return "No tenés permisos para realizar esta acción.";
  }
  return "No pudimos completar la operación. Intentá nuevamente.";
}

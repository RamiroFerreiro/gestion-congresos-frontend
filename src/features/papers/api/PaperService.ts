import { api } from "../../../lib/api";
import type {
  Paper,
  CreatePaperRequest,
  PageResponse,
  PaperFilterParams,
  PaperSummary,
} from "../types/paper";

class PaperService {

  // Listado paginado, filtrado y ordenado de trabajos de un congreso para el administrador
  listCongressPapersAdmin(
    congressCode: string,
    filters: PaperFilterParams,
    signal?: AbortSignal,
  ) {
    const cleanParams: Record<string, string | number | boolean> = {};

    if (filters.status) cleanParams.status = filters.status;
    if (filters.unassigned !== "" && filters.unassigned !== undefined) {
      cleanParams.unassigned = filters.unassigned;
    }
    if (filters.pay !== "" && filters.pay !== undefined) {
      cleanParams.pay = filters.pay;
    }
    if (filters.thematicArea?.trim()) {
      cleanParams.thematicArea = filters.thematicArea.trim();
    }
    if (filters.search?.trim()) {
      cleanParams.search = filters.search.trim();
    }
    if (filters.page !== undefined) cleanParams.page = filters.page;
    if (filters.size !== undefined) cleanParams.size = filters.size;
    if (filters.sort) cleanParams.sort = filters.sort;

    return api.get<PageResponse<PaperSummary>>(
      `/api/papers/congresses/${encodeURIComponent(congressCode)}`,
      {
        params: cleanParams,
        signal,
      },
    );
  }

  // Obtener trabajos de un congreso determinado
  listPapersByCongress(congressId: number) {
    return api.get<Paper[]>("/api/papers", {
      params: {
        congressId,
      },
    });
  }

  // Asignar un evaluador a un trabajo
  assignReviewerToPaper(
    paperId: number,
    reviewerId: number,
  ) {
    return api.patch<void>(
      `/api/papers/${paperId}/reviewers/${reviewerId}`,
    );
  }

  // Obtener trabajos asignados a un evaluador
  listPapersByReviewer(reviewerId: number) {
    return api.get<Paper[]>(
      `/api/papers/reviewer/${reviewerId}`,
    );
  }

  // Traer el detalle de un paper puntual
  getPaperById(paperId: number) {
    return api.get<Paper>(`/api/papers/${paperId}`);
  }

  // Crear un nuevo paper
  createPaper(payload: CreatePaperRequest) {
    return api.post<Paper>("/api/papers", payload);
  }

  // Enviar el paper a revisión
  submitPaper(paperId: number) {
    return api.patch<void>(
      `/api/papers/${paperId}/submit`,
    );
  }

  // Agregar un autor a un paper existente
  addAuthorToPaper(
    paperId: number,
    userId: number,
  ) {
    return api.post<void>(
      `/api/papers/${paperId}/authors/${userId}`,
    );
  }

  // Eliminar un autor de un paper existente
  removeAuthorFromPaper(
    paperId: number,
    userId: number,
  ) {
    return api.delete<void>(
      `/api/papers/${paperId}/authors/${userId}`,
    );
  }
}

export default new PaperService();
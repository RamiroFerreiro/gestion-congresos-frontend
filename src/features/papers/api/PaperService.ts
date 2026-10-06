import { api } from "../../../lib/api";
import type {
  Paper,
  CreatePaperRequest,
} from "../types/paper";

class PaperService {
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
import axios from "axios";
import { Constants } from "../constants/index";

class PaperService {
  /// Obtener trabajos de un congreso determinado:
  listPapersByCongress(congressId, authToken) {
    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {
        congressId: congressId,
      },
    };

    return axios.get(`${Constants.BASE_URL}/api/papers`, config);
  }

  /// Asignar un evaluador a un trabajo:
  assignReviewerToPaper(paperId, reviewerId, authToken) {
    return axios.patch(
      `${Constants.BASE_URL}/api/papers/${paperId}/reviewers/${reviewerId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  }

  // Obtener trabajos asignados a un evaluador
  listPapersByReviewer(reviewerId, authToken) {
    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    };

    return axios.get(
      `${Constants.BASE_URL}/api/papers/reviewer/${reviewerId}`,
      config,
    );
  }

   // Traer el detalle de un Paper puntual
  getPaperById(paperId, authToken) {
    return axios.get(`${Constants.BASE_URL}/api/papers/${paperId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  // Crear un nuevo Paper (nace en estado NOT_SUBMITTED)
  createPaper(payload) {
    return axios.post(`${Constants.BASE_URL}/api/papers`, payload, {
      //headers: {
      //  Authorization: `Bearer ${authToken}`,
      //},
    });
  }

  // Enviar el Paper a revisión: NOT_SUBMITTED/NEEDS_REVISION -> UNDER_EVALUATION
  submitPaper(paperId, authToken) {
    return axios.patch(
      `${Constants.BASE_URL}/api/papers/${paperId}/submit`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  }

  // Agregar un autor a un Paper existente (solo si está NOT_SUBMITTED)
  addAuthorToPaper(paperId, userId, authToken) {
    return axios.post(
      `${Constants.BASE_URL}/api/papers/${paperId}/authors/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  }
  
  // Eliminar un autor de un Paper (solo si está NOT_SUBMITTED, nunca al autor orden 1)
  removeAuthorFromPaper(paperId, userId, authToken) {
    return axios.delete(
      `${Constants.BASE_URL}/api/papers/${paperId}/authors/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  }




}

export default new PaperService();

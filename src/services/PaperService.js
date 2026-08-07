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
}

export default new PaperService();

import axios from "axios";
import { Constants } from "../constants/index";

class CongressService {
  /// Traer congresos (Todos / Activos / Desactivados):
  listCongresses(authToken, enabled = null) {
    // Armamos la configuración base:
    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {}, // Acá van a ir los parámetros de la query.
    };

    // Si se pasó el parámetro 'enabled' (sea true o false), lo agregamos:
    if (enabled !== null && enabled !== undefined) {
      config.params.enabled = enabled;
    }

    return axios.get(`${Constants.BASE_URL}/api/congresses`, config);
  }

  /// Traer congreso por ID:
  getCongressById(congressId, authToken) {
    return axios.get(`${Constants.BASE_URL}/api/congresses/${congressId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  /// Crear un congreso:
  createCongress(payload, authToken) {
    return axios.post(`${Constants.BASE_URL}/api/congresses`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  /// Desactivar un congreso:
  disableCongress(congressId, authToken) {
    return axios.patch(
      `${Constants.BASE_URL}/api/congresses/${congressId}/disable`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  }

  /// Activar un congreso:
  enableCongress(congressId, authToken) {
    return axios.patch(
      `${Constants.BASE_URL}/api/congresses/${congressId}/enable`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  }

  /// Actualizar un congreso:
  updateCongress(payload, congressId, authToken) {
    return axios.put(
      `${Constants.BASE_URL}/api/congresses/${congressId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  }

  /// Obtener usuarios de un congreso con determinado rol:
  listParticipantsByCongressAndRole(congressId, role = null, authToken) {
    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {},
    };

    // Si se pasó el parámetro 'role', lo agregamos:
    if (role !== null && role !== undefined) {
      config.params.role = role;
    }

    return axios.get(
      `${Constants.BASE_URL}/api/congresses/${congressId}/participants`,
      config,
    );
  }

  /// Añadir un participante a un congreso:
  addParticipantToCongress(congressId, participantId, authToken) {
    return axios.post(
      `${Constants.BASE_URL}/api/congresses/${congressId}/participants/${participantId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );
  }
}

export default new CongressService();

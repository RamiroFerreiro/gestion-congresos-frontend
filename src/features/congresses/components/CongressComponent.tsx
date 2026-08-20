// @ts-nocheck

import { useState, useEffect, useRef } from "react";
import congressService from "../api/CongressService"; // ajustá el path real
import { HomeButton } from '../../../components/HomeButton'; // Ajusta la ruta según tu carpeta


const FAKE_TOKEN = "fake-token"; // TODO: reemplazar cuando haya login real

const STATIC_CONGRESS_PAYLOAD = {
  name: "Congreso Internacional Alimentos",
  place: "UNLa",
  registrationStartDate: "2026-08-14T10:00:00",
  registrationEndDate: "2026-08-21T10:00:00",
  presentationStartDate: "2026-08-28T10:00:00",
  presentationEndDate: "2026-09-04T10:00:00",
  startDate: "2026-09-11T10:00:00",
  endDate: "2026-09-18T10:00:00",
  maxNumberOfAuthors: 10,
  keywordRepetition: true,
  minKeywords: 4,
  maxKeywords: 10,
  thematicAreas: ["Inteligencia Artificial", "Ciberseguridad"],
};

function CongressComponent() {
  const [loading, setLoading] = useState(true);
  const [congressData, setCongressData] = useState(null);
  const [error, setError] = useState(null);

  const [newParticipantId, setNewParticipantId] = useState("");
  const [addError, setAddError] = useState(null);

  const hasRunRef = useRef(false); // 👈 nuevo: bandera anti-doble-ejecución

  const refreshCongress = async (congressId) => {
    const response = await congressService.getCongressById(congressId, FAKE_TOKEN);
    setCongressData(response.data);
  };

  useEffect(() => {
    if (hasRunRef.current) return; // 👈 si ya corrió una vez, no lo repite
    hasRunRef.current = true;

    const createCongressFlow = async () => {
      const userId = localStorage.getItem("testUserId");
      if (!userId) {
        setError("No hay un usuario guardado en localStorage. Volvé y tocá 'Guardar' primero.");
        setLoading(false);
        return;
      }

      try {
        const congressResponse = await congressService.createCongress(
          STATIC_CONGRESS_PAYLOAD,
          FAKE_TOKEN
        );
        const congress = congressResponse.data;

        localStorage.setItem("testCongressId", congress.congressId);

        await congressService.addParticipantToCongress(congress.congressId, userId, FAKE_TOKEN);

        await refreshCongress(congress.congressId);
      } catch (err) {
        const backendMessage = err.response?.data?.message || "Error desconocido";
        setError(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    createCongressFlow();
  }, []);

  const handleAddParticipant = async () => {
    const userId = Number(newParticipantId.trim());
    if (!userId || isNaN(userId)) {
      setAddError("Ingresá un ID de usuario válido");
      return;
    }

    try {
      await congressService.addParticipantToCongress(congressData.congressId, userId, FAKE_TOKEN);
      setNewParticipantId("");
      setAddError(null);
      await refreshCongress(congressData.congressId);
      alert(`Usuario ${userId} agregado como participante`);
    } catch (err) {
      const backendMessage = err.response?.data?.message || "Error desconocido";
      setAddError(backendMessage);
    }
  };

  return (
    <div>
      <HomeButton />
      <h1>Agregando congreso...</h1>

      {loading && <p>Cargando...</p>}

      {!loading && error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <div>
          <h2>Respuesta del backend:</h2>
          <pre>{JSON.stringify(congressData, null, 2)}</pre>

          <h3>Agregar participante al congreso</h3>
          <input
            placeholder="ID de usuario a agregar"
            value={newParticipantId}
            onChange={(e) => setNewParticipantId(e.target.value)}
          />
          <button onClick={handleAddParticipant}>Agregar Participante</button>
          {addError && <p style={{ color: "red" }}>Error: {addError}</p>}

          <h3>Participantes actuales:</h3>
          <ul>
            {congressData.participants?.map((p) => (
              <li key={p.userId}>
                {p.firstName} {p.lastName} (ID {p.userId}) - {p.role} - {p.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CongressComponent;
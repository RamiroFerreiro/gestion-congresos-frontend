import { useState } from "react";
import paperService from "../services/PaperService"; // ajustá el path real

const FAKE_TOKEN = "fake-token"; // TODO: reemplazar cuando haya login real

function getDefaultPresentationDate() {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().slice(0, 16);
}

function CreatePaper() {
  const [form, setForm] = useState({
    title: "",
    code: "",
    thematicArea: "",
    summary: "",
    keywords: "",
    presentationDate: getDefaultPresentationDate(),
    authorUserIds: localStorage.getItem("testUserId") || "3",
  });

  const [paperId, setPaperId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false); // 👈 nuevo: refleja si ya se envió el paper

  // 👇 nuevo: estado para el flujo de agregar autor
  const [newAuthorId, setNewAuthorId] = useState("");
  const [authors, setAuthors] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    const congressId = localStorage.getItem("testCongressId");

    if (!congressId) {
      alert("Primero tenés que crear un congreso (ir a 'Crear Congreso Estático' desde la página principal)");
      return;
    }

    const payload = {
      title: form.title,
      code: form.code,
      thematicArea: form.thematicArea,
      summary: form.summary,
      keywords: form.keywords,
      presentationDate: form.presentationDate,
      congressId: congressId,
      authorUserIds: form.authorUserIds
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id)),
    };

    try {
      const response = await paperService.createPaper(payload, FAKE_TOKEN);
      setPaperId(response.data.paperId);
      setAuthors(response.data.authors || []); // 👈 el create ya devuelve la lista inicial de autores
      alert(`Paper guardado. ID: ${response.data.paperId}`);
    } catch (error) {
      const backendMessage = error.response?.data?.message || "Error desconocido";
      alert(`Error al guardar: ${backendMessage}`);
    }
  };

  // 👇 nuevo handler: 1 click, agrega el autor y refresca la lista
  const handleAddAuthor = async () => {
    const userId = Number(newAuthorId.trim());
    if (!userId || isNaN(userId)) {
      alert("Ingresá un ID de usuario válido");
      return;
    }

    try {
      const response = await paperService.addAuthorToPaper(paperId, userId, FAKE_TOKEN);
      setAuthors(response.data); // el endpoint devuelve la lista completa actualizada
      setNewAuthorId("");
      alert(`Autor ${userId} agregado. Total de autores: ${response.data.length}`);
    } catch (error) {
      const backendMessage = error.response?.data?.message || "Error desconocido";
      alert(`Error al agregar autor: ${backendMessage}`);
    }
  };

  const handleSubmitPaper = async () => {
    if (!paperId) {
      alert("Primero tenés que crear el paper antes de enviarlo");
      return;
    }

    try {
      const response = await paperService.submitPaper(paperId, FAKE_TOKEN);
      setIsSubmitted(true); // 👈 bloquea agregar más autores, respetando la regla NOT_SUBMITTED
      alert(`Paper enviado. Mensaje del backend: ${JSON.stringify(response.data)}`);
    } catch (error) {
      const backendMessage = error.response?.data?.message || "Error desconocido";
      alert(`Error al enviar: ${backendMessage}`);
    }
  };

  return (
    <div>
      <h3>Crear Paper</h3>

      <input name="title" placeholder="Título" value={form.title} onChange={handleChange} />
      <br />
      <input name="code" placeholder="Código" value={form.code} onChange={handleChange} />
      <br />
      <input name="thematicArea" placeholder="Área temática" value={form.thematicArea} onChange={handleChange} />
      <br />
      <input name="summary" placeholder="Resumen" value={form.summary} onChange={handleChange} />
      <br />
      <input name="keywords" placeholder="Palabras clave" value={form.keywords} onChange={handleChange} />
      <br />
      <input
        type="datetime-local"
        name="presentationDate"
        value={form.presentationDate}
        onChange={handleChange}
      />
      <br />
      <input
        name="authorUserIds"
        placeholder="IDs de autores separados por coma"
        value={form.authorUserIds}
        onChange={handleChange}
      />
      <br />

      <button onClick={handleCreate}>Guardar Paper</button>
      <button onClick={handleSubmitPaper} disabled={!paperId || isSubmitted}>
        Enviar Paper
      </button>

      {paperId && <p>Paper ID actual: {paperId}</p>}

      {/* 👇 nueva sección: agregar autor, 1 click */}
      {paperId && (
        <div>
          <h4>Agregar autor al Paper</h4>
          <input
            placeholder="ID de usuario a agregar"
            value={newAuthorId}
            onChange={(e) => setNewAuthorId(e.target.value)}
            disabled={isSubmitted}
          />
          <button onClick={handleAddAuthor} disabled={isSubmitted}>
            Agregar Autor
          </button>
          {isSubmitted && <p>El paper ya fue enviado, no se pueden agregar más autores.</p>}

          <h4>Autores actuales:</h4>
          <ul>
            {authors.map((a) => (
              <li key={a.authorId}>
                {a.authorOrder}. {a.fullName} (ID {a.authorId}) - {a.email}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CreatePaper;
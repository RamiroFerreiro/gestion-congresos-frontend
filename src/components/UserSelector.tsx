import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

const TEST_USERS = [
  { id: 1, label: "ID 1 = Admin" },
  { id: 2, label: "ID 2 = Evaluador" },
  { id: 3, label: "ID 3 = Presentador" },
];

function UserSelector() {
    const [selectedUserId, setSelectedUserId] = useState(TEST_USERS[0].id);
    const navigate = useNavigate();

    const handleSave = () => {
        localStorage.setItem("testUserId", String(selectedUserId));
        alert(`Usuario guardado: ID ${selectedUserId}`);
        };


    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        fetch("http://localhost:8080/api/users/test")
        .then((response) => response.json())
        .then((data) => setMensaje(data.mensaje))
        .catch((error) => console.error(error));
    }, []);

    return (

        <div>
            <h1>Frontend React</h1>
            <h2>{mensaje}</h2>
            <br/>
            <p>
                Corre el script de datos de usuario y roles con anterioridad.
                <br/>
                Seleccione con que usuario hacer la request:
                <br />
                ID 1 = Admin
                <br />
                ID 2 = Evaluador
                <br />
                ID 3 = Presentador
                <br />
                <br />
                Tener en cuenta que se debe generar un congreso antes de generar un paper.
                <br />
                <br />
                Tanto el usuario como el Id del congreso a crear quedan guardados en localstorage para facilitar pruebas.
                
            </p>

            <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
                {TEST_USERS.map((u) => (
                <option key={u.id} value={u.id}>
                    {u.label}
                </option>
                ))}
            </select>

            <button onClick={handleSave}>Guardar</button>

            <br />
            <br />

            <button onClick={() => navigate("/crear-congreso")}>Crear Congreso Estático con el Usuario seleccionado respetando su Rol</button>
            
            <br />
            <br />

            <button onClick={() => navigate("/crear-paper")}>Crear Paper</button>


        </div>
    );
}

export default UserSelector;
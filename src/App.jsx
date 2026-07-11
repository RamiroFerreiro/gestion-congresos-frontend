import { useState, useEffect } from 'react';
import './App.css';

function App() {

  const [mensaje, setMensaje] = useState("");

  useEffect(() => {

    fetch("http://localhost:8080/api/users/test")
      .then(response => response.json())
      .then(data => setMensaje(data.mensaje))
      .catch(error => console.error(error));

  }, []);

  return (
    <>
      <h1>Frontend React</h1>
      <h2>{mensaje}</h2>
    </>
  );

}

export default App;

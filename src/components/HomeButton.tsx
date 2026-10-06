import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/')}
      style={styles.button}
      title="Volver al inicio"
    >
      <span style={styles.arrow}>←</span> Volver
    </button>
  );
};

// Estilos mínimos e inline para no requerir archivos CSS adicionales
const styles = {
  button: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151', // Gris oscuro discreto
    backgroundColor: '#f3f4f6', // Gris claro suave
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginBottom: '16px', // Espaciado para que no se pegue al contenido de abajo
  },
  arrow: {
    fontSize: '16px',
    lineHeight: '1',
  },
};
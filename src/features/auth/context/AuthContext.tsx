import { createContext, useContext, useState, ReactNode } from "react";
import { AuthService, type AuthResponse } from "../api/AuthService";
import { type LoginFormData } from "../schemas/loginSchema";
import { api } from "../../../lib/api";

// Definimos qué información y funciones estarán disponibles para toda la app.
interface AuthContextType {
  // Guardamos solo los datos del usuario, sin el token
  user: Omit<AuthResponse, "token"> | null;
  isAuthenticated: boolean;
  login: (credentials: LoginFormData) => Promise<void>;
  logout: () => void;
}

// Creamos el contexto con un valor inicial nulo.
const AuthContext = createContext<AuthContextType | null>(null);

// Este componente envolverá nuestra aplicación y proveerá el estado.
export function AuthProvider({ children }: { children: ReactNode }) {
  // Inicializamos el estado del usuario leyendo del localStorage si existe
  // Esto es vital para mantener la sesión al recargar la página.
  const [user, setUser] = useState<Omit<AuthResponse, "token"> | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (credentials: LoginFormData) => {
    try {
      // Llamamos a nuestro servicio (que usa la instancia de Axios)
      const response = await AuthService.login(credentials);

      // Extraemos el token del resto de la información del usuario
      const { token, ...userData } = response;

      // Guardamos el token en localStorage para que nuestro interceptor de Axios lo encuentre
      localStorage.setItem("token", token);
      
      // Guardamos la info del usuario en localStorage para persistir tras recargar
      localStorage.setItem("user", JSON.stringify(userData));

      // Actualizamos el estado de React para que la app reaccione inmediatamente
      setUser(userData);
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      throw error; // Lanzamos el error para que LoginPage lo atrape y muestre un mensaje
    }
  };

  const logout = () => {
    // Limpiamos todo al salir
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // El valor que exponemos al resto de la aplicación
  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Creamos un Hook personalizado para consumir el contexto fácilmente.
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
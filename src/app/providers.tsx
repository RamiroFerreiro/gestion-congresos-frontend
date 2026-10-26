import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { queryClient } from "../lib/queryClient";
import { theme } from "./theme";
import { AuthProvider } from "../features/auth/context/AuthContext";

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Este componente agrupa todos los proveedores de estado y configuración
 * de la aplicación. Envolverá al router principal en App.tsx.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/*
          El AuthProvider va dentro de ThemeProvider por si el contexto de
          autenticación necesitara en algún momento usar componentes de UI,
          y dentro de QueryClientProvider por si necesita hacer peticiones al server.
        */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
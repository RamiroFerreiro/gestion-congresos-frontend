import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../auth/context/AuthContext";
import CongressService from "../api/CongressService";
import AvailableCongressCard from "../components/AvailableCongressCard";
import InstitutionDialog from "../components/InstitutionDialog";
import { getCongressError } from "../lib/congressErrors";
import type { AvailableCongress } from "../types/congress";

export default function CongressesPage() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [dialog, setDialog] = useState<{
    congress: AvailableCongress;
    editing: boolean;
  } | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const congresses = useQuery({
    queryKey: ["available-congresses", user?.userId],
    queryFn: async () =>
      (await CongressService.listCongresses(true)).data.filter(
        (congress) => congress.enabled,
      ),
    enabled: !!user,
    retry: false,
  });
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!user) return null;
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          mb: 3,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.6rem",
              mb: 0.5,
            }}
          >
            Congresos disponibles
          </Typography>
          <Typography color="text.secondary">
            Elegí el congreso al que querés ingresar o inscribirte.
          </Typography>
        </Box>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: "0.75rem",
            }}
          >
            {user.firstName.slice(0, 1)}
            {user.lastName.slice(0, 1)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {user.firstName} {user.lastName}
          </Typography>
        </Box>
      </Box>
      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess(null)}
          sx={{ mb: 3 }}
        >
          {success}
        </Alert>
      )}
      {congresses.isPending ? (
        <Box
          role="status"
          sx={{ display: "flex", alignItems: "center", gap: 2, py: 4 }}
        >
          <CircularProgress size={24} />
          <Typography>Cargando congresos…</Typography>
        </Box>
      ) : congresses.isError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" onClick={() => void congresses.refetch()}>
              Reintentar
            </Button>
          }
        >
          {getCongressError(congresses.error)}
        </Alert>
      ) : congresses.data.length === 0 ? (
        <Alert severity="info">
          Todavía no hay congresos habilitados. Volvé a consultar más adelante.
        </Alert>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 2,
          }}
        >
          {congresses.data.map((congress) => (
            <AvailableCongressCard
              key={congress.code}
              congress={congress}
              userId={user.userId}
              now={now}
              onInstitution={(selected, editing) => {
                setSuccess(null);
                setDialog({ congress: selected, editing });
              }}
            />
          ))}
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>
        La información y las acciones disponibles dependen de tu participación
        en cada congreso.
      </Typography>
      {dialog && (
        <InstitutionDialog
          congress={dialog.congress}
          userId={user.userId}
          editing={dialog.editing}
          onClose={() => setDialog(null)}
          onSuccess={(message) => {
            setDialog(null);
            setSuccess(message);
          }}
        />
      )}
    </>
  );
}

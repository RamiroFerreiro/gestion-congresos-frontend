import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import CongressService from "../api/CongressService";
import InstitutionDialog from "../components/InstitutionDialog";
import MyCongressCard from "../components/MyCongressCard";
import MyCongressCardSkeleton from "../components/MyCongressCardSkeleton";
import SuperAdminCongressesEmptyState from "../components/SuperAdminCongressesEmptyState";
import { getCongressError } from "../lib/congressErrors";
import { getCongressCreationMessage } from "../lib/congressCreation";
import type { MyCongressSummary } from "../types/congress";

export default function MyCongressesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [creationMessage, setCreationMessage] = useState(() =>
    getCongressCreationMessage(location.state),
  );
  const [now, setNow] = useState(() => new Date());
  const [institutionCongress, setInstitutionCongress] =
    useState<MyCongressSummary | null>(null);
  const congresses = useQuery({
    queryKey: ["my-congresses", user?.userId],
    queryFn: ({ signal }) => CongressService.listMyCongresses(signal),
    enabled: Boolean(user),
    retry: false,
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!user) return null;

  const isSuperAdmin = user.superAdmin === true;
  const isSuperAdminEmpty =
    isSuperAdmin && congresses.isSuccess && congresses.data.data.length === 0;
  const isSuperAdminList = isSuperAdmin && !isSuperAdminEmpty;
  const title = "Mis congresos";
  const description = isSuperAdminEmpty
    ? "Creá y configurá tus congresos desde un único lugar."
    : isSuperAdmin
      ? "Elegí el congreso que querés gestionar. Cada congreso cuenta con sus propios trabajos, evaluaciones, pagos y configuraciones."
      : "Elegí el congreso que querés consultar o gestionar según tu rol.";
  const gridSx = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: isSuperAdmin ? 3 : 2,
  };
  const createButtonSx = isSuperAdminList
    ? { px: 3, py: 1.25, minHeight: 48, fontSize: "1rem" }
    : undefined;

  return (
    <Stack
      spacing={isSuperAdminList ? 3.5 : 3}
      sx={{
        width: "100%",
        maxWidth: isSuperAdminList ? 1440 : undefined,
        mx: isSuperAdminList ? "auto" : undefined,
        px: isSuperAdmin ? 4 : 0,
        pt: isSuperAdminEmpty ? 2 : isSuperAdminList ? 1 : 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
        }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{
              fontFamily: "var(--font-serif)",
              fontSize: isSuperAdminEmpty
                ? "1.5rem"
                : isSuperAdminList
                  ? "2.5rem"
                  : "1.8rem",
              fontWeight: isSuperAdminList ? 700 : 600,
            }}
          >
            {title}
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              mt: 0.75,
              maxWidth: isSuperAdminList ? undefined : 690,
              fontSize: isSuperAdminList ? "1rem" : undefined,
            }}
          >
            {description}
          </Typography>
          {!isSuperAdminEmpty && (
            <Box
              sx={{ display: "flex", gap: 1.5, mt: isSuperAdminList ? 3 : 2 }}
            >
              {!isSuperAdmin && (
                <Button
                  component={RouterLink}
                  to="/congresses"
                  variant="outlined"
                >
                  Explorar congresos
                </Button>
              )}
              {isSuperAdmin && congresses.isPending && (
                <Button
                  variant="contained"
                  disabled
                  sx={{
                    ...createButtonSx,
                    "&.Mui-disabled": {
                      bgcolor: "primary.main",
                      color: "common.white",
                      opacity: 0.45,
                    },
                  }}
                >
                  + Crear nuevo congreso
                </Button>
              )}
              {isSuperAdmin && congresses.isSuccess && (
                <Button
                  component={RouterLink}
                  to="/admin/congresses/new"
                  variant="contained"
                  sx={createButtonSx}
                >
                  + Crear nuevo congreso
                </Button>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {creationMessage && (
        <Alert
          severity="success"
          onClose={() => {
            setCreationMessage(null);
            navigate("/my-congresses", { replace: true, state: null });
          }}
        >
          {creationMessage}
        </Alert>
      )}

      {congresses.isPending ? (
        <Box role="status">
          <Typography
            component="span"
            sx={{
              position: "absolute",
              width: "1px",
              height: "1px",
              overflow: "hidden",
              clipPath: "inset(50%)",
              whiteSpace: "nowrap",
            }}
          >
            Cargando tus congresos…
          </Typography>
          <Box aria-busy="true" sx={gridSx}>
            <MyCongressCardSkeleton isSuperAdmin={isSuperAdmin} />
            <MyCongressCardSkeleton isSuperAdmin={isSuperAdmin} />
          </Box>
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
      ) : isSuperAdminEmpty ? (
        <SuperAdminCongressesEmptyState
          onCreateCongress={() => navigate("/admin/congresses/new")}
        />
      ) : congresses.data.data.length === 0 ? (
        <Alert
          severity="info"
          action={
            <Button component={RouterLink} to="/congresses" color="inherit">
              Explorar congresos
            </Button>
          }
        >
          Todavía no tenés congresos asociados. Explorá los congresos
          disponibles para inscribirte.
        </Alert>
      ) : (
        <Box sx={gridSx}>
          {congresses.data.data.map((congress) => (
            <MyCongressCard
              key={congress.code}
              congress={congress}
              now={now}
              onCompleteInstitution={setInstitutionCongress}
            />
          ))}
        </Box>
      )}

      {!congresses.isPending && !congresses.isError && !isSuperAdminEmpty && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: isSuperAdminList ? "1rem" : undefined }}
        >
          La información y las acciones disponibles dependen de tu rol dentro de
          cada congreso.
        </Typography>
      )}

      {institutionCongress && (
        <InstitutionDialog
          congress={institutionCongress}
          userId={user.userId}
          editing
          onClose={() => setInstitutionCongress(null)}
          onSuccess={() => setInstitutionCongress(null)}
        />
      )}
    </Stack>
  );
}

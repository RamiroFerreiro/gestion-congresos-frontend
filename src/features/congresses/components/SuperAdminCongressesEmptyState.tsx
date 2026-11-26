import { Box, Button, Stack, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

interface Props {
  onCreateCongress?: () => void;
}

export default function SuperAdminCongressesEmptyState({
  onCreateCongress,
}: Props) {
  return (
    <Stack
      component="section"
      aria-labelledby="super-admin-empty-title"
      spacing={3}
      sx={{
        alignItems: "center",
        justifyContent: "center",
        minHeight: 390,
        px: 4,
        py: 6,
        textAlign: "center",
        border: "1px dashed",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.6),
        borderRadius: 2,
        background: (theme) =>
          `linear-gradient(110deg, ${alpha(theme.palette.primary.main, 0.025)}, ${alpha(theme.palette.primary.main, 0.11)})`,
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          width: 72,
          height: 72,
          borderRadius: "60%",
          bgcolor: "primary.main",
          color: "common.white",
          display: "grid",
          placeItems: "center",
          fontSize: "2rem",
          fontWeight: 400,
          lineHeight: 1,
        }}
      >
        +
      </Box>
      <Typography
        id="super-admin-empty-title"
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.5rem",
          fontWeight: 600,
          lineHeight: 1.25,
        }}
      >
        Todavía no creaste ningún congreso
      </Typography>
      <Typography sx={{ maxWidth: 960, color: "text.secondary" }}>
        Completá los datos principales para comenzar a gestionar trabajos,
        evaluaciones, pagos y configuraciones.
      </Typography>
      <Tooltip
        title={
          onCreateCongress
            ? ""
            : "Creación de congresos disponible próximamente."
        }
        describeChild
      >
        <span tabIndex={onCreateCongress ? undefined : 0}>
          <Button
            variant="contained"
            disabled={!onCreateCongress}
            onClick={onCreateCongress}
            endIcon={<span aria-hidden="true">→</span>}
            sx={{ minWidth: 240, mt: 1, px: 4, py: 1.25, fontSize: "1rem" }}
          >
            Crear congreso
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}

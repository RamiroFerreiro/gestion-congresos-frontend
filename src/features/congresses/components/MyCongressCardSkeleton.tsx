import { Box, Paper, Skeleton } from "@mui/material";
import { alpha } from "@mui/material/styles";

interface Props {
  isSuperAdmin: boolean;
}

export default function MyCongressCardSkeleton({ isSuperAdmin }: Props) {
  return (
    <Paper
      aria-hidden="true"
      variant="outlined"
      sx={{
        p: isSuperAdmin ? 4 : 2.75,
        minWidth: 0,
        minHeight: isSuperAdmin ? 360 : 260,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        gap: isSuperAdmin ? 2.25 : 2,
        "& .MuiSkeleton-root": {
          bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.18),
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& .MuiSkeleton-root, & .MuiSkeleton-root::after": {
            animation: "none",
          },
        },
      }}
    >
      <Skeleton
        variant="rounded"
        animation="wave"
        height={isSuperAdmin ? 35 : 25}
      />
      <Skeleton variant="rounded" animation="wave" width="42%" height={18} />
      <Box
        sx={{
          borderTop: 1,
          borderColor: "divider",
          pt: isSuperAdmin ? 2.5 : 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 2,
          }}
        >
          <Box>
            <Skeleton
              variant="rounded"
              animation="wave"
              width="35%"
              height={16}
            />
            <Skeleton
              variant="rounded"
              animation="wave"
              width="75%"
              height={isSuperAdmin ? 24 : 18}
              sx={{ mt: 1, borderRadius: isSuperAdmin ? 3 : 1 }}
            />
          </Box>
          <Box>
            <Skeleton
              variant="rounded"
              animation="wave"
              width="60%"
              height={16}
            />
            <Skeleton
              variant="rounded"
              animation="wave"
              width="95%"
              height={18}
              sx={{ mt: 1 }}
            />
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          {isSuperAdmin && (
            <Skeleton
              variant="rounded"
              animation="wave"
              width="20%"
              height={16}
              sx={{ mb: 1 }}
            />
          )}
          <Skeleton
            variant="rounded"
            animation="wave"
            width="40%"
            height={18}
          />
        </Box>
      </Box>
      <Skeleton
        variant="rounded"
        animation="wave"
        height={isSuperAdmin ? 48 : 36}
        sx={{ mt: "auto" }}
      />
    </Paper>
  );
}

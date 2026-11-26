import { Box, Paper, Skeleton, Stack, Typography } from "@mui/material";

export default function CongressDashboardSkeleton() {
  return (
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
        Cargando el panel del congreso…
      </Typography>
      <Stack
        aria-hidden="true"
        aria-busy="true"
        spacing={2.5}
        sx={{
          "@media (prefers-reduced-motion: reduce)": {
            "& .MuiSkeleton-root, & .MuiSkeleton-root::after": {
              animation: "none",
            },
          },
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.75, borderRadius: 2 }}>
          <Skeleton variant="rounded" width="25%" height={32} />
          <Skeleton width="75%" height={36} sx={{ mt: 2 }} />
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 2,
              mt: 2,
            }}
          >
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} variant="rounded" height={60} />
            ))}
          </Box>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
          <Skeleton width="40%" height={36} />
        </Paper>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            alignItems: "start",
            gap: 2.5,
          }}
        >
          {[6, 3].map((count) => (
            <Paper
              key={count}
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 2 }}
            >
              <Skeleton width="40%" height={28} />
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {Array.from({ length: count }, (_, index) => (
                  <Skeleton key={index} variant="rounded" height={46} />
                ))}
              </Stack>
            </Paper>
          ))}
        </Box>
      </Stack>
    </Box>
  );
}

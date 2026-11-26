import {
  Box,
  Button,
  ButtonBase,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

interface MetricRow {
  label: string;
  description: string;
  count: number;
  to?: string;
  tone: "primary" | "secondary" | "warning" | "success" | "error";
}

interface Props {
  id: string;
  title: string;
  description: string;
  rows: MetricRow[];
  action?: { label: string; to: string };
}

export default function CongressMetricGroup({
  id,
  title,
  description,
  rows,
  action,
}: Props) {
  return (
    <Paper
      component="section"
      aria-labelledby={id}
      variant="outlined"
      sx={{ p: 2.5, borderRadius: 2 }}
    >
      <Typography
        id={id}
        component="h2"
        sx={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.1rem",
          fontWeight: 600,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1, mb: 1.5 }}
      >
        {description}
      </Typography>
      <Stack>
        {rows.map(({ label, description: caption, count, to, tone }) => {
          const content = (
            <>
              <Box
                component="span"
                sx={{
                  minWidth: 32,
                  height: 32,
                  px: 0.75,
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 700,
                  bgcolor: (theme) =>
                    alpha(
                      count
                        ? theme.palette[tone].main
                        : theme.palette.text.secondary,
                      0.09,
                    ),
                  color: count ? `${tone}.main` : "text.secondary",
                }}
              >
                {count.toLocaleString("es-AR")}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ display: "block", fontWeight: 700 }}
                >
                  {label}
                </Typography>
                <Typography
                  component="span"
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.25 }}
                >
                  {caption}
                </Typography>
              </Box>
              {to && (
                <Box
                  component="span"
                  aria-hidden="true"
                  sx={{ color: "text.secondary" }}
                >
                  →
                </Box>
              )}
            </>
          );
          const rowSx = {
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            py: 1.5,
            width: "100%",
            textAlign: "left",
            borderTop: 1,
            borderColor: "divider",
          } as const;
          return to ? (
            <ButtonBase
              key={label}
              component={RouterLink}
              to={to}
              sx={{
                ...rowSx,
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
                },
                "&.Mui-focusVisible": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: 2,
                },
              }}
            >
              {content}
            </ButtonBase>
          ) : (
            <Box key={label} sx={rowSx}>
              {content}
            </Box>
          );
        })}
      </Stack>
      {action && (
        <Button
          component={RouterLink}
          to={action.to}
          variant="outlined"
          fullWidth
          sx={{ mt: 1.5 }}
        >
          {action.label}
        </Button>
      )}
    </Paper>
  );
}

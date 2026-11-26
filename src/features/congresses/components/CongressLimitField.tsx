import { Box, Button, TextField, Typography } from "@mui/material";

interface Props {
  id: string;
  label: string;
  value: number | null;
  onChange: (value: number | null) => void;
  onBlur: () => void;
  inputRef: (instance: HTMLInputElement | null) => void;
  error?: string;
}

export default function CongressLimitField({
  id,
  label,
  value,
  onChange,
  onBlur,
  inputRef,
  error,
}: Props) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 3,
        py: 2,
      }}
    >
      <Box>
        <Typography component="label" htmlFor={id} sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Dejá vacío para no establecer un límite.
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "flex-start", flexShrink: 0 }}>
        <Button
          type="button"
          aria-label={`Reducir ${label.toLowerCase()}`}
          onClick={() => onChange(Math.max(1, (value ?? 1) - 1))}
          sx={{ minWidth: 36, height: 40 }}
        >
          −
        </Button>
        <TextField
          id={id}
          name={id}
          type="number"
          size="small"
          value={value ?? ""}
          onChange={(event) =>
            onChange(
              event.target.value === "" ? null : Number(event.target.value),
            )
          }
          onBlur={onBlur}
          inputRef={inputRef}
          error={!!error}
          helperText={error}
          slotProps={{ htmlInput: { min: 1, max: 2147483647, step: 1 } }}
          sx={{ width: error ? 220 : 85 }}
        />
        <Button
          type="button"
          aria-label={`Aumentar ${label.toLowerCase()}`}
          onClick={() => onChange(Math.min(2147483647, (value ?? 0) + 1))}
          sx={{ minWidth: 36, height: 40 }}
        >
          +
        </Button>
      </Box>
    </Box>
  );
}

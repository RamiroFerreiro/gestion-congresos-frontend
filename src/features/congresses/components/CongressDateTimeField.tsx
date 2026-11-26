import { Box, FormHelperText, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimeField } from "@mui/x-date-pickers/TimeField";
import dayjs from "dayjs";

interface Props {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: (instance: HTMLInputElement | null) => void;
  disabled: boolean;
  error?: string;
  labelInField?: boolean;
}

export default function CongressDateTimeField({
  name,
  label,
  value,
  onChange,
  onBlur,
  inputRef,
  disabled,
  error,
  labelInField = false,
}: Props) {
  const labelId = `${name}-label`;
  const errorId = `${name}-error`;
  const separator = value.indexOf("T");
  const datePart = separator < 0 ? value : value.slice(0, separator);
  const timePart = separator < 0 ? "" : value.slice(separator + 1);
  const updateValue = (date: string, time: string) => {
    // También se conservan valores incompletos: Zod los rechaza y el wizard
    // puede desmontar el control sin perder la fecha o la hora ya ingresadas.
    onChange(date || time ? `${date}T${time}` : "");
  };
  return (
    <Box>
      <Typography
        id={labelId}
        variant="body2"
        sx={
          labelInField
            ? {
                position: "absolute",
                width: "1px",
                height: "1px",
                overflow: "hidden",
                clipPath: "inset(50%)",
                whiteSpace: "nowrap",
              }
            : { fontWeight: 600, mb: 0.75 }
        }
      >
        {label}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 100px",
          gap: 1,
        }}
      >
        <DatePicker
          name={name}
          label={labelInField ? label : "Fecha"}
          value={datePart ? dayjs(datePart) : null}
          onChange={(date) =>
            updateValue(date ? date.format("YYYY-MM-DD") : "", timePart)
          }
          inputRef={inputRef}
          disabled={disabled}
          format="DD/MM/YY"
          slotProps={{
            textField: {
              id: `${name}-date`,
              fullWidth: true,
              size: "small",
              required: true,
              error: !!error,
              onBlur,
              slotProps: {
                inputLabel: { shrink: true },
                input: {
                  "aria-labelledby": labelInField
                    ? `${name}-date-label`
                    : `${labelId} ${name}-date-label`,
                  "aria-describedby": error ? errorId : undefined,
                },
              },
              sx: { "& .MuiPickersOutlinedInput-root": { bgcolor: "#F3EFEE" } },
            },
            desktopPaper: {
              sx: { border: 1, borderColor: "divider", borderRadius: 2 },
            },
          }}
        />
        <TimeField
          label="Hora"
          value={timePart ? dayjs(`2000-01-01T${timePart}`) : null}
          onChange={(time) =>
            updateValue(datePart, time ? time.format("HH:mm") : "")
          }
          disabled={disabled}
          format="HH:mm"
          ampm={false}
          slotProps={{
            textField: {
              id: `${name}-time`,
              fullWidth: true,
              size: "small",
              required: true,
              error: !!error,
              onBlur,
              slotProps: {
                inputLabel: { shrink: true },
                input: {
                  "aria-labelledby": `${labelId} ${name}-time-label`,
                  "aria-describedby": error ? errorId : undefined,
                },
              },
              sx: { "& .MuiPickersOutlinedInput-root": { bgcolor: "#F3EFEE" } },
            },
          }}
        />
      </Box>
      {error && (
        <FormHelperText id={errorId} error sx={{ mx: 0 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
}

import {
  Box,
  TextField,
  Typography,
  type TextFieldProps,
} from "@mui/material";

interface RegisterFieldProps
  extends Omit<TextFieldProps, "label"> {
  label: string;
  numericOnly?: boolean;
}

/**
 * Campo reutilizable para el formulario de registro.
 *
 * Extiende las propiedades de TextField para poder recibir
 * valores, eventos y estados de error desde el formulario.
 *
 * Este componente no conoce React Hook Form ni Zod.
 * Su responsabilidad es únicamente visual.
 */
function RegisterField({
  id,
  label,
  numericOnly = false,
  ...textFieldProps
}: RegisterFieldProps) {
  return (
    <Box>
      <Typography
        component="label"
        htmlFor={id}
        variant="body2"
        sx={{
          display: "block",
          color: "text.secondary",
          fontWeight: 600,
          mb: 0.75,
          textAlign: "left",
        }}
      >
        {label}
      </Typography>

      <TextField
        id={id}
        size="small"
        fullWidth
        {...textFieldProps}
        onChange={(event) => {
          /*
           * Algunos campos, como DNI, solo admiten números.
           * El resto mantiene el comportamiento normal del TextField.
           */
          if (numericOnly) {
            event.target.value = event.target.value.replace(/\D/g, "");
          }

          textFieldProps.onChange?.(event);
        }}
      />
    </Box>
  );
}

export default RegisterField;
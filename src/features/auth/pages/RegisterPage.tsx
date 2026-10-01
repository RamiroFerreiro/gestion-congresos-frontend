import {
  Box,
  Button,
  Link,
  Paper,
  TextField,
  Typography,
  FormControl,
  MenuItem,
  Select,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PasswordField from "../components/PasswordField";

/**
 * Vista de registro de usuarios de C4T.
 *
 * Responsabilidades:
 * - Presentar los datos necesarios para crear una cuenta.
 * - Mantener la composición visual definida para el flujo de autenticación.
 * - Permitir regresar al inicio de sesión si el usuario ya posee una cuenta.
 *
 * Los elementos compartidos del flujo de autenticación
 * (logo, identidad C4T, tagline y estructura general)
 * son responsabilidad de AuthLayout.
 *
 * En esta etapa se implementa únicamente el maquetado.
 * La gestión del formulario y sus validaciones se incorporarán
 * posteriormente mediante React Hook Form y Zod.
 */
function RegisterPage() {
  return (
    <Box
      sx={{
        width: "100%",

        // Registro contiene más información que Login, por lo que
        // utiliza una card ligeramente más ancha sin perder responsividad.
        maxWidth: 700,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",

          // Registro tiene más contenido que Login,
          // por eso reducimos únicamente su padding vertical.
          "@media (max-height: 850px)": {
            py: 2,
          },
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "text.primary",
            mb: 0.75,
            textAlign: "left",
          }}
        >
          Crear una cuenta
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            mb: 2.5,
            textAlign: "left",
          }}
        >
          Completá tus datos personales e institucionales para comenzar.
        </Typography>

        {/*
          Los campos se distribuyen en dos columnas cuando existe
          espacio suficiente. En pantallas pequeñas pasan automáticamente
          a una única columna para mantener la usabilidad.
        */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 2,

            // Compactamos solamente la separación entre filas.
            "@media (max-height: 850px)": {
              rowGap: 1.25,
            },
          }}
        >
          <RegisterField id="firstName" label="Nombre" placeholder="Juan" />

          <RegisterField id="lastName" label="Apellido" placeholder="Pérez" />

          <RegisterField
            id="email"
            label="Correo electrónico"
            type="email"
            placeholder="nombre@institucion.edu.ar"
          />

          <RegisterField
            id="dni"
            label="DNI"
            placeholder="12345678"
            numericOnly={true}
          />

          <RegisterField
            id="institution"
            label="Institución"
            placeholder="Universidad Nacional de Lanús"
          />

          <Box>
            <Typography
              component="label"
              htmlFor="country"
              variant="body2"
              sx={{
                display: "block",
                color: "text.secondary",
                fontWeight: 600,
                mb: 0.75,
                textAlign: "left",
              }}
            >
              País
            </Typography>

            <FormControl fullWidth size="small">
              {/*
                País se modela como una selección cerrada para evitar
                variaciones de escritura y mantener valores consistentes
                al momento de enviarlos al backend.
              */}
              <Select
                id="country"
                defaultValue="Argentina"
                inputProps={{
                  "aria-label": "País",
                }}
              >
                <MenuItem value="Argentina">Argentina</MenuItem>
                <MenuItem value="Uruguay">Uruguay</MenuItem>
                <MenuItem value="Chile">Chile</MenuItem>
                <MenuItem value="Paraguay">Paraguay</MenuItem>
                <MenuItem value="Brasil">Brasil</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <PasswordField
            id="password"
            label="Contraseña"
            placeholder="••••••••"
          />
          
          <PasswordField
            id="confirmPassword"
            label="Confirmar contraseña"
            placeholder="••••••••"
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 3,
            py: 1.25,
          }}
        >
          Crear cuenta
        </Button>
      </Paper>

      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          mt: 3,
        }}
      >
        ¿Ya tenés una cuenta?{" "}
        <Link
          component={RouterLink}
          to="/auth/login"
          underline="hover"
          sx={{
            color: "primary.dark",
            fontWeight: 600,
          }}
        >
          Iniciá sesión
        </Link>
      </Typography>
    </Box>
  );
}

/**
 * Campo visual reutilizable exclusivamente para el formulario de registro.
 *
 * Centraliza la estructura label + TextField para evitar repetir
 * el mismo bloque de maquetado en cada dato solicitado al usuario.
 *
 * Si este patrón comienza a utilizarse en otros formularios de C4T,
 * podrá extraerse posteriormente a un componente compartido.
 */
interface RegisterFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  numericOnly?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
}

function RegisterField({
  id,
  label,
  type = "text",
  placeholder,
  numericOnly,
  showPassword,
  onTogglePassword,
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
        type={onTogglePassword ? (showPassword ? "text" : "password") : type}
        placeholder={placeholder}
        size="small"
        fullWidth
        onChange={
          numericOnly
            ? (event) => {
                // Elimina cualquier carácter que no sea un dígito.
                event.target.value = event.target.value.replace(/\D/g, "");
              }
            : undefined
        }
        slotProps={{
          htmlInput: numericOnly
            ? {
                // DNI se mantiene como texto porque representa un
                // identificador y no un valor destinado a cálculos.
                //
                // inputMode muestra teclado numérico en dispositivos
                // móviles y pattern restringe semánticamente el campo
                // a caracteres numéricos.
                inputMode: "numeric",
                pattern: "[0-9]*",
              }
            : undefined,
        }}
      />
    </Box>
  );
}

export default RegisterPage;

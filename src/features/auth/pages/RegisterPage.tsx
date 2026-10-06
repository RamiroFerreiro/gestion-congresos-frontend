import {
  Box,
  Button,
  Link,
  Paper,
  Typography,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/registerSchema";
import PasswordField from "../components/PasswordField";
import RegisterField from "../components/RegisterField";

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
  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dni: "",
      institution: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log(data);
  };

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
        component="form"
        onSubmit={handleSubmit(onSubmit)}
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
          <Controller
            name="firstName"
            control={control}
            render={({ field, fieldState }) => (
              <RegisterField
                id="firstName"
                label="Nombre"
                placeholder="Juan"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field, fieldState }) => (
              <RegisterField
                id="lastName"
                label="Apellido"
                placeholder="Noli"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <RegisterField
                id="email"
                label="Correo electrónico"
                type="email"
                placeholder="nombre@institucion.edu.ar"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="dni"
            control={control}
            render={({ field, fieldState }) => (
              <RegisterField
                id="dni"
                label="DNI"
                placeholder="12345678"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                numericOnly={true}
              />
            )}
          />

          <Controller
            name="institution"
            control={control}
            render={({ field, fieldState }) => (
              <RegisterField
                id="institution"
                label="Institución"
                placeholder="Universidad Nacional de Lanús"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Box>
            <Controller
              name="country"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth size="small" error={!!fieldState.error}>
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

                  <Select {...field} id="country" displayEmpty>
                    <MenuItem value="">
                      <em>Seleccioná un país</em>
                    </MenuItem>
                    <MenuItem value="Argentina">Argentina</MenuItem>
                  </Select>

                  {fieldState.error && (
                    <FormHelperText>{fieldState.error.message}</FormHelperText>
                  )}
                </FormControl>
              )}
            />
          </Box>

          <Controller
            name="password"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                id="password"
                label="Contraseña"
                placeholder="••••••••"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field, fieldState }) => (
              <PasswordField
                id="confirmPassword"
                label="Confirmar contraseña"
                placeholder="••••••••"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />
        </Box>

        <Button
          type="submit"
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

export default RegisterPage;

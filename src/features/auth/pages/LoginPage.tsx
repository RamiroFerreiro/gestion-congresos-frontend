import { Box, Button, Link, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PasswordField from "../components/PasswordField";
import { loginSchema, type LoginFormData } from "../schemas/loginSchema";
import RegisterField from "../components/RegisterField";

/**
 * Vista de inicio de sesión de C4T.
 *
 * Responsabilidades:
 * - Renderizar el formulario visual de inicio de sesión.
 * - Permitir navegar hacia recuperación de contraseña y registro.
 * - Mantener la composición definida en el prototipo de C4T.
 *
 * AuthLayout se encarga de los elementos compartidos del flujo
 * de autenticación, como la identidad visual y el fondo.
 *
 * En esta etapa se implementa únicamente el maquetado.
 * La lógica del formulario y las validaciones se incorporarán
 * posteriormente con React Hook Form y Zod.
 */
function LoginPage() {
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    console.log(data);
  };

  return (
    <Box
      sx={{
        // La página puede reducirse en pantallas pequeñas,
        // pero conserva las proporciones del formulario del prototipo.
        width: "100%",
        maxWidth: 450,
      }}
    >
      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        elevation={1}
        sx={{
          p: 3.5,
          borderRadius: 2,

          // El prototipo utiliza una card limpia con borde sutil,
          // por eso evitamos la sombra predeterminada de MUI.
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "text.primary",
            mb: 2,
            textAlign: "left",
          }}
        >
          Iniciar sesión
        </Typography>

        {/*
          Los labels se ubican fuera de los TextField para evitar
          el floating label de Material UI y respetar el prototipo.
        */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.25,
          }}
        >
          <Controller
            name="email"
            control={control}
            render={({ field, fieldState }) => (
              <RegisterField
                id="email"
                label="Correo electrónico"
                placeholder="nombre@institucion.edu.ar"
                {...field}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

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

          {/*
            Al no incluir "Recordarme", el enlace de recuperación
            permanece alineado al extremo derecho de la card.
          */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: -0.5,
            }}
          >
            <Link
              component={RouterLink}
              to="/auth/forgot-password"
              underline="hover"
              sx={{
                color: "primary.dark",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              py: 1.25,
              mt: 0.25,
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Ingresar
          </Button>
        </Box>
      </Paper>

      {/*
        Estas acciones quedan fuera de la card porque forman parte
        del cierre visual de la pantalla definido en el prototipo.
      */}
      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          mt: 3,
        }}
      >
        ¿No tenés una cuenta?{" "}
        <Link
          component={RouterLink}
          to="/auth/register"
          underline="hover"
          sx={{
            color: "primary.dark",
            fontWeight: 600,
          }}
        >
          Registrate
        </Link>
      </Typography>

      <Typography
        variant="body2"
        sx={{
          textAlign: "center",
          color: "text.secondary",
          mt: 1,
          mx: "auto",
          maxWidth: 360,
        }}
      >
        Ingresá para gestionar tus trabajos, evaluaciones o inscripciones.
      </Typography>
    </Box>
  );
}

export default LoginPage;

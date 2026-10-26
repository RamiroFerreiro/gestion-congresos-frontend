import { useState } from "react";
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
  Alert,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios"; // Lo importamos para evaluar el tipo de error

import { registerSchema, type RegisterFormData } from "../schemas/registerSchema";
import PasswordField from "../components/PasswordField";
import RegisterField from "../components/RegisterField";
import { AuthService } from "../api/AuthService";

function RegisterPage() {
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      dni: "",
      country: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setRegisterError(null);
    try {
      await AuthService.register(data);
      
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);

    } catch (error) {
      console.error("Error al registrar usuario:", error);
      
      // Manejo específico según la documentación de tu backend
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          setRegisterError("Ya existe una cuenta con este correo electrónico.");
          return;
        }
        if (error.response?.status === 400) {
          setRegisterError("Revisá los datos ingresados. Hay un error de formato.");
          return;
        }
      }
      
      setRegisterError("Ocurrió un error inesperado al intentar crear tu cuenta.");
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 700 }}>
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
          "@media (max-height: 850px)": { py: 2 },
        }}
      >
        <Typography variant="h5" sx={{ color: "text.primary", mb: 0.75, textAlign: "left" }}>
          Crear una cuenta
        </Typography>

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2.5, textAlign: "left" }}>
          Completá tus datos personales para comenzar.
        </Typography>

        {registerError && (
          <Alert severity="error" sx={{ mb: 2 }}>{registerError}</Alert>
        )}

        {isSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ¡Cuenta creada con éxito! Redirigiendo al inicio de sesión...
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            "@media (max-height: 850px)": { rowGap: 1.25 },
          }}
        >
          <Controller name="firstName" control={control} render={({ field, fieldState }) => ( <RegisterField id="firstName" label="Nombre" placeholder="Juan" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} /> )} />
          <Controller name="lastName" control={control} render={({ field, fieldState }) => ( <RegisterField id="lastName" label="Apellido" placeholder="Noli" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} /> )} />
          <Controller name="email" control={control} render={({ field, fieldState }) => ( <RegisterField id="email" label="Correo electrónico" type="email" placeholder="nombre@institucion.edu.ar" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} /> )} />
          <Controller name="dni" control={control} render={({ field, fieldState }) => ( <RegisterField id="dni" label="DNI" placeholder="12345678" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} numericOnly={true} /> )} />
          
          <Box>
            <Controller
              name="country"
              control={control}
              render={({ field, fieldState }) => (
                <FormControl fullWidth size="small" error={!!fieldState.error}>
                  <Typography component="label" htmlFor="country" variant="body2" sx={{ display: "block", color: "text.secondary", fontWeight: 600, mb: 0.75, textAlign: "left" }}>País</Typography>
                  <Select {...field} id="country" displayEmpty>
                    <MenuItem value=""><em>Seleccioná un país</em></MenuItem>
                    <MenuItem value="Argentina">Argentina</MenuItem>
                    {/* Podés agregar más países aquí luego */}
                  </Select>
                  {fieldState.error && <FormHelperText>{fieldState.error.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>

          <Controller name="password" control={control} render={({ field, fieldState }) => ( <PasswordField id="password" label="Contraseña" placeholder="••••••••" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} /> )} />
          <Controller name="confirmPassword" control={control} render={({ field, fieldState }) => ( <PasswordField id="confirmPassword" label="Confirmar contraseña" placeholder="••••••••" {...field} error={!!fieldState.error} helperText={fieldState.error?.message} /> )} />
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isSubmitting || isSuccess}
          sx={{ mt: 3, py: 1.25 }}
        >
          {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </Paper>

      <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary", mt: 3 }}>
        ¿Ya tenés una cuenta?{" "}
        <Link component={RouterLink} to="/auth/login" underline="hover" sx={{ color: "primary.dark", fontWeight: 600 }}>
          Iniciá sesión
        </Link>
      </Typography>
    </Box>
  );
}

export default RegisterPage;
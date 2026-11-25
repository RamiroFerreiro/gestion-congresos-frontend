import {
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import type { Ref } from "react";
import { getCountryOptions } from "../lib/countries";

interface CountrySelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  inputRef?: Ref<HTMLInputElement>;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
}

export default function CountrySelect({
  id,
  name,
  value,
  onChange,
  onBlur,
  inputRef,
  error = false,
  helperText,
  disabled = false,
}: CountrySelectProps) {
  const labelId = `${id}-label`;
  const helperId = `${id}-helper`;

  return (
    <FormControl fullWidth size="small" error={error} disabled={disabled}>
      <Typography
        id={labelId}
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
        País
      </Typography>
      <Select
        id={id}
        labelId={labelId}
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        inputRef={inputRef}
        inputProps={{ "aria-describedby": helperText ? helperId : undefined }}
        displayEmpty
      >
        <MenuItem value="">
          <em>Seleccioná un país</em>
        </MenuItem>
        {getCountryOptions(value).map((country) => (
          <MenuItem key={country.code} value={country.name}>
            {country.name}
          </MenuItem>
        ))}
      </Select>
      {helperText && (
        <FormHelperText id={helperId}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
}

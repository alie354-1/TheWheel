import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  InputLabel,
  FormControl,
  FormHelperText,
  Typography,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { BusinessDomain } from "../types/domain.types";
import { SketchPicker } from "react-color";
import PaletteIcon from "@mui/icons-material/Palette";
import BusinessIcon from "@mui/icons-material/Business";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import { icons } from "./domainIcons"; // Assume a list of icon components

export interface DomainEditModalProps {
  open: boolean;
  domain: BusinessDomain;
  onSave: (updates: Partial<BusinessDomain>) => Promise<void>;
  onClose: () => void;
  loading?: boolean;
  error?: string | null;
}

interface FormValues {
  name: string;
  description: string;
  color: string;
  icon: string;
}

const DomainEditModal: React.FC<DomainEditModalProps> = ({
  open,
  domain,
  onSave,
  onClose,
  loading = false,
  error,
}) => {
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      name: domain?.name || "",
      description: domain?.description || "",
      color: domain?.color || "#1976d2",
      icon: domain?.icon || "BusinessIcon",
    },
  });

  // Reset form when domain changes or modal opens
  React.useEffect(() => {
    if (domain) {
      reset({
        name: domain.name || "",
        description: domain.description || "",
        color: domain.color || "#1976d2",
        icon: domain.icon || "BusinessIcon",
      });
    }
  }, [domain, reset]);

  const color = watch("color");
  const icon = watch("icon");

  const handleColorChange = (colorResult: any) => {
    setValue("color", colorResult.hex, { shouldValidate: true });
  };

  const handleIconSelect = (iconName: string) => {
    setValue("icon", iconName, { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    await onSave({
      name: values.name,
      description: values.description,
      color: values.color,
      icon: values.icon,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Domain</DialogTitle>
      <DialogContent>
        <form id="domain-edit-form" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Domain name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Name"
                fullWidth
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                autoFocus
              />
            )}
          />
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Description"
                fullWidth
                margin="normal"
                multiline
                minRows={2}
                maxRows={4}
              />
            )}
          />
          <Box sx={{ mt: 2, mb: 2 }}>
            <InputLabel shrink>Color</InputLabel>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor: field.value,
                        border: "1px solid #ccc",
                        mr: 2,
                      }}
                    />
                    <SketchPicker
                      color={field.value}
                      onChange={handleColorChange}
                      disableAlpha
                      presetColors={[
                        "#1976d2",
                        "#388e3c",
                        "#fbc02d",
                        "#d32f2f",
                        "#7b1fa2",
                        "#0288d1",
                        "#c2185b",
                        "#ffa000",
                        "#455a64",
                        "#607d8b",
                        "#43a047",
                        "#f44336",
                        "#ffeb3b",
                        "#00bcd4",
                        "#8bc34a",
                        "#e91e63",
                      ]}
                    />
                  </>
                )}
              />
            </Box>
          </Box>
          <Box sx={{ mt: 2, mb: 2 }}>
            <InputLabel shrink>Icon</InputLabel>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {Object.entries(icons).map(([iconName, IconComponent]) => (
                <IconButton
                  key={iconName}
                  onClick={() => handleIconSelect(iconName)}
                  color={icon === iconName ? "primary" : "default"}
                  sx={{
                    border: icon === iconName ? "2px solid #1976d2" : "1px solid #ccc",
                    bgcolor: icon === iconName ? "#e3f2fd" : "transparent",
                  }}
                  aria-label={iconName}
                >
                  {React.createElement(IconComponent)}
                </IconButton>
              ))}
            </Box>
            <FormHelperText>
              Choose an icon that best represents this domain.
            </FormHelperText>
          </Box>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="domain-edit-form"
          variant="contained"
          color="primary"
          disabled={loading}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DomainEditModal;

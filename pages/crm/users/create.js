// pages/crm/users/create.js
import { useState } from "react";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { useRouter } from "next/router";
import { useEntity } from "@/lib/hooks/useEntity";
import PhoneMask from "@/components/ui/fields/PhoneInput";
import { validateUser } from "@/lib/utils/validation";
import userService from "@/lib/api/userService";

export default function CreateUserPage() {
  const router = useRouter();

  const { createItem, loading, error, setEntityState } = useEntity(userService);

  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    role: "USER",
    firstname: "",
    lastname: "",
    phone: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateUser(form);
    if (!validation.valid) {
      return setEntityState((prev) => {
        return { ...prev, error: validation.errors };
      });
    }

    const submitData = {
      email: form.email,
      password: form.password,
      role: form.role,
      enabled: form.enabled,
      firstname: form?.firstname || null,
      lastname: form?.lastname || null,
      phone: form?.phone || null,
    };

    createItem(submitData, () => {
      router.push("/crm/users");
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <CrmLayout>
      <h1>Создание пользователя</h1>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
        <TextField
          required
          fullWidth
          size="small"
          label="Email"
          name="email"
          margin="normal"
          value={form.email}
          onChange={handleChange}
        />

        <TextField
          required
          fullWidth
          size="small"
          label="Пароль"
          type="password"
          name="password"
          margin="normal"
          value={form.password}
          onChange={handleChange}
        />

        <TextField
          required
          fullWidth
          size="small"
          label="Повторите пароль"
          type="password"
          name="passwordConfirm"
          margin="normal"
          value={form.passwordConfirm}
          onChange={handleChange}
          error={form.password !== form.passwordConfirm}
          helperText={form.password !== form.passwordConfirm && "Пароли не совпадают"}
        />

        <FormControl fullWidth size="small" margin="normal">
          <InputLabel>Роль</InputLabel>
          <Select value={form.role} label="Роль" name="role" onChange={handleChange}>
            <MenuItem value="ADMIN">Админ</MenuItem>
            <MenuItem value="USER">Пользователь</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          size="small"
          label="Имя"
          name="firstname"
          margin="normal"
          value={form.firstname}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          size="small"
          label="Фамилия"
          name="lastname"
          margin="normal"
          value={form.lastname}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          size="small"
          label="Телефон"
          name="phone"
          margin="normal"
          value={form.phone}
          onChange={handleChange}
          slotProps={{
            input: {
              inputComponent: PhoneMask,
              inputProps: { placeholderChar: "_", lazy: form.phone === "" },
            },
          }}
        />

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            type="button"
            variant="outlined"
            disabled={loading}
            size="small"
            onClick={() => router.push("/crm/users")}
          >
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading} size="small">
            {loading ? "Создание..." : "Создать"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

// pages/crm/users/[id]/edit.js
import { useState } from "react";
import { useRouter } from "next/router";
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { useEntity } from "@/lib/hooks/useEntity";
import PhoneMask from "@/components/ui/fields/PhoneInput";
import { validateUser } from "@/lib/utils/validation";
import userService from "@/lib/api/userService";
import prisma from "@/lib/prisma";

export default function EditUserPage({ initialData }) {
  const router = useRouter();
  const { id } = router.query;
  const { updateItem, loading, error, setEntityState } = useEntity(userService);

  const [form, setForm] = useState({
    email: initialData?.email,
    role: initialData?.role,
    enabled: initialData?.enabled,
    firstname: initialData?.firstname || "",
    lastname: initialData?.lastname || "",
    phone: initialData?.phone || "",
    password: "",
    passwordConfirm: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация только если меняется пароль
    const validation = validateUser(form, true);
    if (!validation.valid) {
      return setEntityState((prev) => ({ ...prev, error: validation.errors }));
    }

    // Подготовка данных для отправки
    const submitData = {
      email: form.email,
      role: form.role,
      enabled: form.enabled,
      firstname: form.firstname,
      lastname: form.lastname,
      phone: form.phone,
    };

    // Добавляем пароль только если он изменен
    if (form.password) {
      submitData.password = form.password;
    }

    await updateItem(id, submitData, () => {
      router.push("/crm/users");
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!initialData) return null;

  return (
    <CrmLayout>
      <h1>Редактирование пользователя</h1>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
        <TextField
          required
          fullWidth
          size="small"
          margin="normal"
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
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
          margin="normal"
          label="Имя"
          name="firstname"
          value={form.firstname}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          size="small"
          margin="normal"
          label="Фамилия"
          name="lastname"
          value={form.lastname}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          size="small"
          margin="normal"
          label="Телефон"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          slotProps={{
            input: {
              inputComponent: PhoneMask,
              inputProps: { placeholderChar: "_", lazy: form.phone === "" },
            },
          }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={form.enabled}
              onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
          }
          label="Активен"
          size="small"
          margin="normal"
        />

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Изменить пароль
        </Typography>
        <TextField
          fullWidth
          size="small"
          margin="normal"
          label="Новый пароль"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          size="small"
          margin="normal"
          label="Повторите пароль"
          type="password"
          name="passwordConfirm"
          value={form.passwordConfirm}
          onChange={handleChange}
          error={form.password !== form.passwordConfirm}
          helperText={form.password !== form.passwordConfirm && "Пароли не совпадают"}
        />

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button type="button" variant="outlined" onClick={() => router.push("/crm/users")} disabled={loading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const data = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!data) {
      throw new Error("Запись не найдена");
    }

    return {
      props: {
        initialData: JSON.parse(JSON.stringify(data)),
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      redirect: {
        destination: "/crm/users?error=EntityNotFound",
        permanent: false,
      },
    };
  }
}

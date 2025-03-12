import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import prisma from "@/lib/prisma";
import TextMaskCustom from "@/components/ui/fields/TextMaskCustom";

const validateEmail = (email) => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})*$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

const clearPhone = (phone) => phone.replace(/[^0-9]/g, "");

export default function EditUserPage({ user, notFound }) {
  const router = useRouter();

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: user.email,
    password: "",
    passwordConfirm: "",
    role: user.role,
    enabled: user.enabled,
    firstname: user.firstname || "",
    lastname: user.lastname || "",
    phone: user.phone || "",
  });

  const clearedPhone = clearPhone(form.phone);

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.email) {
      setError("Email обязателен");
      return false;
    }
    if (!validateEmail(form.email)) {
      setError("Неверный формат email");
      return false;
    }
    if (form.password || form.passwordConfirm) {
      if (form.password !== form.passwordConfirm) {
        setError("Пароли не совпадают");
        return false;
      }
    }
    if (clearedPhone && !validatePhone(clearedPhone)) {
      setError("Неверный формат телефона");
      return false;
    }
    return true;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    const updateData = {
      email: form.email,
      role: form.role,
      enabled: form.enabled,
      firstname: form.firstname,
      lastname: form.lastname,
      phone: clearedPhone,
    };
    if (form.password) {
      updateData.password = form.password;
    }
    try {
      const res = await fetch(`/api/crm/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка сервера");
      toast.success("Пользователь обновлен!");
      router.push("/crm/users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (notFound) {
    router.push("/crm/users");
    toast.error("Пользователь не найден");
  }

  return (
    <CrmLayout>
      <h1>Редактирование пользователя</h1>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
        <TextField
          fullWidth
          size="small"
          label="Email"
          name="email"
          sx={{ mb: 2 }}
          value={form.email}
          onChange={handleChange}
          error={!!error && form.email !== "" && !validateEmail(form.email)}
        />

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
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
          sx={{ mb: 2 }}
          value={form.firstname}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          size="small"
          label="Фамилия"
          name="lastname"
          sx={{ mb: 2 }}
          value={form.lastname}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          size="small"
          label="Телефон"
          name="phone"
          sx={{ mb: 2 }}
          value={form.phone}
          onChange={handleChange}
          onFocus={(e) => {
            if (!clearedPhone) {
              handleChange({ target: { name: e.target.name, value: "(___) ___-__-__" } });
            }
          }}
          onBlur={(e) => {
            if (!clearedPhone) {
              handleChange({ target: { name: e.target.name, value: "" } });
            }
          }}
          slotProps={{
            input: {
              inputComponent: TextMaskCustom,
              inputProps: { mask: "(000) 000-00-00", placeholderChar: "_", lazy: form.phone === "" },
            },
          }}
          error={!!clearedPhone && !validatePhone(clearedPhone)}
          helperText={!!clearedPhone && !validatePhone(clearedPhone) && "Формат: 10 цифр без пробелов"}
        />

        <FormControlLabel
          control={
            <Switch
              checked={form.enabled}
              onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
            />
          }
          label="Активен"
          sx={{ mb: 2 }}
        />

        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Изменить пароль
        </Typography>
        <TextField
          fullWidth
          size="small"
          label="Новый пароль"
          type="password"
          name="password"
          sx={{ mb: 2 }}
          value={form.password}
          onChange={handleChange}
        />
        <TextField
          required={Boolean(form.password)}
          fullWidth
          size="small"
          label="Повторите новый пароль"
          type="password"
          name="passwordConfirm"
          sx={{ mb: 2 }}
          value={form.passwordConfirm}
          onChange={handleChange}
          error={(form.password || form.passwordConfirm) && form.password !== form.passwordConfirm}
          helperText={
            (form.password || form.passwordConfirm) && form.password !== form.passwordConfirm && "Пароли не совпадают"
          }
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: { xs: "column-reverse", sm: "row" },
            justifyContent: "space-between",
          }}
        >
          <Button
            type="button"
            variant="contained"
            color="secondary"
            disabled={loading}
            onClick={() => router.push("/crm/users")}
          >
            Назад
          </Button>
          <Button type="submit" variant="contained" color="success" disabled={loading}>
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

// Предзагрузка данных пользователя через getServerSideProps
export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      throw new Error("Пользователь не найден");
    }

    return {
      props: { user: JSON.parse(JSON.stringify(user)) }, // Передаем данные пользователя в компонент
    };
  } catch (error) {
    console.error(error);
    return {
      redirect: {
        destination: "/crm/users",
        permanent: false,
      },
    };
  }
}

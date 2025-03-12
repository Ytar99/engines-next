// pages/crm/users/create.js
import { useState } from "react";
import { Box, TextField, Button, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { useRouter } from "next/router";
import TextMaskCustom from "@/components/ui/fields/TextMaskCustom";
import { toast } from "react-toastify";

const validateEmail = (email) => /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]{2,})*$/.test(email);
const validatePhone = (phone) => /^[0-9]{10}$/.test(phone);

const clearPhone = (phone) => phone.replace(/[^0-9]/g, "");

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    role: "USER",
    enabled: true,
    firstname: "",
    lastname: "",
    phone: "",
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearedPhone = clearPhone(form.phone);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!form.email || !form.password || !form.passwordConfirm) {
      setError("Заполните все обязательные поля");
      return false;
    }

    if (form.password !== form.passwordConfirm) {
      setError("Пароли не совпадают");
      return false;
    }

    if (!validateEmail(form.email)) {
      setError("Неверный формат электронной почты");
      return false;
    }

    if (clearedPhone && !validatePhone(clearedPhone)) {
      setError("Неверный формат телефона");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const sanitazedData = { ...form, phone: clearedPhone };
    delete sanitazedData.passwordConfirm;

    try {
      const res = await fetch("/api/crm/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitazedData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Ошибка сервера");

      toast.success("Пользователь создан!");
      router.push("/crm/users");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          sx={{ mb: 2 }}
          value={form.email}
          onChange={handleChange}
          error={!!error && form.email !== "" && !validateEmail(form.email)}
        />

        <TextField
          required
          fullWidth
          size="small"
          label="Пароль"
          type="password"
          name="password"
          sx={{ mb: 2 }}
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
          sx={{ mb: 2 }}
          value={form.passwordConfirm}
          onChange={handleChange}
          error={form.password !== form.passwordConfirm}
          helperText={form.password !== form.passwordConfirm && "Пароли не совпадают"}
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
            !clearedPhone && handleChange({ target: { name: e.target.name, value: "(___) ___-__-__" } });
          }}
          onBlur={(e) => {
            !clearedPhone && handleChange({ target: { name: e.target.name, value: "" } });
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
            {loading ? "Создание..." : "Создать пользователя"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

import { useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateCustomer, validatePhone } from "@/lib/utils/validation";
import TextMaskCustom from "@/components/ui/fields/TextMaskCustom";
import { useCustomer } from "@/lib/hooks/useCustomer";
import { toast } from "react-toastify";

const clearPhone = (phone) => phone.replace(/[^0-9]/g, "");

export default function CreateCustomerPage() {
  const router = useRouter();
  const { createCustomer, loading, error } = useCustomer();
  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    phone: "",
  });

  const clearedPhone = clearPhone(form.phone);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateCustomer({ ...form, phone: clearedPhone });
    if (!validation.valid) {
      toast.error(validation.errors);
      return;
    }

    try {
      await createCustomer({
        ...form,
        phone: form.phone ? clearedPhone : null,
      });
      router.push("/crm/customers");
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <CrmLayout>
      <h1>Создание покупателя</h1>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
        <TextField
          required
          fullWidth
          label="Email"
          name="email"
          size="small"
          value={form.email}
          margin="normal"
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Имя"
          name="firstname"
          size="small"
          value={form.firstname}
          margin="normal"
          onChange={handleChange}
        />

        <TextField
          fullWidth
          label="Фамилия"
          name="lastname"
          size="small"
          value={form.lastname}
          margin="normal"
          onChange={handleChange}
        />

        <TextField
          fullWidth
          size="small"
          label="Телефон"
          name="phone"
          value={form.phone}
          margin="normal"
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
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? "Создание..." : "Создать"}
          </Button>
          <Button variant="outlined" disabled={loading} onClick={() => router.push("/crm/customers")}>
            Отмена
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

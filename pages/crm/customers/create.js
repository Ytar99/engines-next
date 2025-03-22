import { useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateCustomer } from "@/lib/utils/validation";
import { useEntity } from "@/lib/hooks/useEntity";
import customerService from "@/lib/api/customerService";
import PhoneMask from "@/components/ui/fields/PhoneInput";

export default function CreateCustomerPage() {
  const router = useRouter();
  const { createItem, loading, error, setEntityState } = useEntity(customerService);

  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    phone: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateCustomer(form);
    if (!validation.valid) {
      return setEntityState((prev) => ({ ...prev, error: validation.errors }));
    }

    const submitData = {
      email: form.email,
      firstname: form?.firstname || null,
      lastname: form?.lastname || null,
      phone: form?.phone || null,
    };

    createItem(submitData, () => {
      router.push("/crm/customers");
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <CrmLayout>
      <h1>Создание покупателя</h1>
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
          <Button type="button" variant="outlined" disabled={loading} onClick={() => router.push("/crm/customers")}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Создание..." : "Создать"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

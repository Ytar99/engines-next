import { useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateCustomer } from "@/lib/utils/validation";
import { useEntity } from "@/lib/hooks/useEntity";
import prisma from "@/lib/prisma";
import customerService from "@/lib/api/customerService";
import PhoneMask from "@/components/ui/fields/PhoneInput";

export default function EditCustomerPage({ initialData }) {
  const router = useRouter();
  const { id } = router.query;
  const { updateItem, loading, error, setEntityState } = useEntity(customerService);

  const [form, setForm] = useState({
    email: initialData?.email || "",
    firstname: initialData?.firstname || "",
    lastname: initialData?.lastname || "",
    phone: initialData?.phone || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateCustomer(form, true);
    if (!validation.valid) {
      return setEntityState((prev) => ({ ...prev, error: validation.errors }));
    }

    const submitData = {
      email: form.email,
      firstname: form?.firstname || null,
      lastname: form?.lastname || null,
      phone: form?.phone || null,
    };

    updateItem(id, submitData, () => {
      router.push("/crm/customers");
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!initialData) return null;

  return (
    <CrmLayout>
      <h1>Редактирование покупателя</h1>
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

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button type="button" variant="outlined" onClick={() => router.push("/crm/customers")} disabled={loading}>
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
    const data = await prisma.customer.findUnique({
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
    console.error("Error fetching customer:", error);
    return {
      redirect: {
        destination: "/crm/customers?error=EntityNotFound",
        permanent: false,
      },
    };
  }
}

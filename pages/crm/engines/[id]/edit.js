// pages/crm/engines/[id]/edit.js
import { useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateEngine } from "@/lib/utils/validation";
import { useEntity } from "@/lib/hooks/useEntity";
import prisma from "@/lib/prisma";
import engineService from "@/lib/api/engineService";

export default function EditEnginePage({ initialData }) {
  const router = useRouter();
  const { id } = router.query;
  const { updateItem, loading, error, setEntityState } = useEntity(engineService);

  const [form, setForm] = useState({
    name: initialData?.name || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    const validation = validateEngine(form);
    if (!validation.valid) {
      return setEntityState((prev) => ({
        ...prev,
        error: validation.errors,
      }));
    }

    const submitData = {
      name: form.name,
    };

    updateItem(id, submitData, () => {
      router.push("/crm/engines");
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (!initialData) return null;

  return (
    <CrmLayout>
      <h1>Редактирование двигателя</h1>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
        <TextField
          required
          fullWidth
          size="small"
          margin="normal"
          label="Название"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button type="button" variant="outlined" onClick={() => router.push("/crm/engines")} disabled={loading}>
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
    const data = await prisma.engine.findUnique({
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
    console.error("Error fetching engine:", error);
    return {
      redirect: {
        destination: "/crm/engines?error=EntityNotFound",
        permanent: false,
      },
    };
  }
}

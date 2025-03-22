// pages/crm/engines/create.js
import { useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateEngine } from "@/lib/utils/validation";
import { useEntity } from "@/lib/hooks/useEntity";
import engineService from "@/lib/api/engineService";

export default function CreateEnginePage() {
  const router = useRouter();
  const { createItem, loading, error, setEntityState } = useEntity(engineService);

  const [form, setForm] = useState({
    name: "",
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

    createItem(submitData, () => {
      router.push("/crm/engines");
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <CrmLayout>
      <h1>Создание двигателя</h1>
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
          <Button
            type="button"
            variant="outlined"
            disabled={loading}
            size="small"
            onClick={() => router.push("/crm/engines")}
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

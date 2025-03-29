import { useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateCategorySync } from "@/lib/utils/validation";
import { useEntity } from "@/lib/hooks/useEntity";
import categoryService from "@/lib/api/categoryService";

export default function CreateCategoryPage() {
  const router = useRouter();
  const { createItem, loading, error, setEntityState } = useEntity(categoryService);

  const [form, setForm] = useState({
    name: "",
    slug: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateCategorySync(form);
    if (!validation.valid) {
      return setEntityState({ error: validation.errors });
    }

    const submitData = {
      name: form.name.trim(),
      slug: form.slug.trim().toLowerCase(),
    };

    createItem(submitData, () => router.push("/crm/categories"));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <CrmLayout>
      <h1>Создание категории</h1>
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

        <TextField
          required
          fullWidth
          size="small"
          margin="normal"
          label="URL-адрес"
          name="slug"
          value={form.slug}
          onChange={handleChange}
          helperText="Уникальный идентификатор категории (латинские буквы, цифры и дефисы)"
        />

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button type="button" variant="outlined" onClick={() => router.push("/crm/categories")} disabled={loading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Создание..." : "Создать"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

// pages/crm/engines/create.js
import { useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateEngine } from "@/lib/utils/validation";
import { useEngine } from "@/lib/hooks/useEngine";

export default function CreateEnginePage() {
  const router = useRouter();
  const { createEngine, loading, error } = useEngine();
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateEngine({ name });
    if (!validation.valid) {
      toast.error(validation.errors);
      return;
    }

    try {
      await createEngine({ name });
      router.push("/crm/engines");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CrmLayout>
      <h1>Создание двигателя</h1>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
        <TextField
          fullWidth
          label="Название"
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
          required
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
          <Button variant="outlined" onClick={() => router.back()}>
            Отмена
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

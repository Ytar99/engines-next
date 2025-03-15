// pages/crm/engines/[id]/edit.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TextField, Button, Box, Alert } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateEngine } from "@/lib/utils/validation";
import { useEngine } from "@/lib/hooks/useEngine";
import prisma from "@/lib/prisma";

export default function EditEnginePage({ initialEngine }) {
  const router = useRouter();
  const { updateEngine, loading, error } = useEngine();
  const [name, setName] = useState("");

  useEffect(() => {
    if (initialEngine) {
      setName(initialEngine.name);
    }
  }, [initialEngine]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateEngine({ name });
    if (!validation.valid) {
      toast.error(validation.errors);
      return;
    }

    try {
      await updateEngine(initialEngine.id, { name });
      router.push("/crm/engines");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <CrmLayout>
      <h1>Редактирование двигателя</h1>
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
            {loading ? "Сохранение..." : "Сохранить"}
          </Button>
          <Button variant="outlined" onClick={() => router.back()}>
            Отмена
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const engine = await prisma.engine.findUnique({
      where: { id: parseInt(id) },
    });

    if (!engine) {
      return {
        redirect: {
          destination: "/crm/engines",
          permanent: false,
        },
      };
    }

    return {
      props: {
        initialEngine: JSON.parse(JSON.stringify(engine)),
      },
    };
  } catch (error) {
    console.error("Error fetching engine:", error);
    return {
      redirect: {
        destination: "/crm/engines",
        permanent: false,
      },
    };
  }
}

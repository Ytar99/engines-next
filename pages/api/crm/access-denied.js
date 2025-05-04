// pages/crm/access-denied.js
import { Typography, Box } from "@mui/material";
import PublicLayout from "@/components/layouts/PublicLayout";

export default function AccessDenied() {
  return (
    <PublicLayout>
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Typography variant="h5">Доступ запрещен. Обратитесь к администратору.</Typography>
      </Box>
    </PublicLayout>
  );
}

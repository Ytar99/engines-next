import { Box, Container, Paper } from "@mui/material";
import Header from "@/components/ui/Header";

export default function PublicLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: (theme) => theme.palette.grey[200], // Фон всей страницы
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Container maxWidth="xl">
          <Header />
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          flex: 1,
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 3,
            width: "100%",
            height: "100%",
            backgroundColor: "background.paper",
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}

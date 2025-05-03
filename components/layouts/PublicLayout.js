import { Box, Container } from "@mui/material";
import Header from "@/components/ui/Header";

export default function PublicLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "background.paper",
        }}
      >
        <Container maxWidth="xl">
          <Header />
        </Container>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: { xs: 3, md: 4 },
          backgroundColor: "background.default",
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              backgroundColor: "background.paper",
            }}
          >
            {children}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

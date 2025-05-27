import { Box, Container, Typography, Link as MuiLink } from "@mui/material";
import Link from "next/link";

const footerSections = [
  {
    section: "Информация",
    links: [
      { title: "О нас", path: "/about" },
      { title: "Оплата и доставка", path: "/payment-delivery" },
      { title: "Контакты", path: "/contacts" },
      { title: "Режим работы", path: "/working-hours" },
    ],
  },
  {
    section: "Документы",
    links: [
      { title: "Лицензионное соглашение", path: "/license" },
      { title: "Политика конфиденциальности", path: "/privacy" },
    ],
  },
];

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        backgroundColor: "background.paper",
        py: 4,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl" sx={{ px: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 4,
            textAlign: { xs: "center", md: "left" },
            px: 3,
          }}
        >
          {/* Контактная информация */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Контакты
            </Typography>
            <Typography variant="body2">Телефон: +7 (XXX) XXX-XX-XX</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Email: example@domain.com
            </Typography>
          </Box>

          {/* Динамические разделы со ссылками */}
          {footerSections.map((section) => (
            <Box key={section.section}>
              <Typography variant="h6" gutterBottom>
                {section.section}
              </Typography>
              {section.links.map((link) => (
                <MuiLink
                  key={link.path}
                  component={Link}
                  href={link.path}
                  color="text.secondary"
                  variant="body2"
                  display="block"
                  gutterBottom
                >
                  {link.title}
                </MuiLink>
              ))}
            </Box>
          ))}
        </Box>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          © {new Date().getFullYear()} АвтоДВС. Все права защищены.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;

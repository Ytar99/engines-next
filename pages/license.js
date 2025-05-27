import PublicLayout from "@/components/layouts/PublicLayout";
import {
  Box,
  Typography,
  Link,
  Breadcrumbs,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import { useRef } from "react";

const sections = [
  {
    id: "general",
    title: "1. Общие положения",
    content: `Настоящее Лицензионное соглашение (далее - "Соглашение") регулирует условия использования...`,
  },
  {
    id: "rights",
    title: "2. Права и ограничения",
    content: `Правообладатель предоставляет Пользователю неисключительную...`,
  },
  {
    id: "responsibilities",
    title: "3. Обязанности сторон",
    content: `Пользователь обязуется использовать программное обеспечение исключительно...`,
  },
  {
    id: "termination",
    title: "4. Прекращение действия",
    content: `Соглашение может быть расторгнуто в одностороннем порядке...`,
  },
];

export default function LicenseAgreementPage() {
  const theme = useTheme();
  const contentRef = useRef(null);

  return (
    <PublicLayout>
      <Container maxWidth="xl" ref={contentRef}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover">
            Главная
          </Link>
          <Typography color="text.primary">Лицензионное соглашение</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <ArticleIcon fontSize="large" color="primary" />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              color: theme.palette.text.primary,
            }}
          >
            Лицензионное соглашение
          </Typography>
        </Box>

        {/* Оглавление */}
        <Box
          sx={{
            p: 3,
            mb: 4,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Содержание
          </Typography>
          <List dense>
            {sections.map((section, index) => (
              <ListItem
                key={index}
                component="a"
                href={`#${section.id}`}
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <ListItemText primary={section.title} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Основное содержание */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          {sections.map((section, index) => (
            <Box key={section.id} sx={{ mb: 4 }} id={section.id}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 2,
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                }}
              >
                {section.title}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  textAlign: "justify",
                  lineHeight: 1.6,
                  color: theme.palette.text.secondary,
                }}
              >
                {section.content}
              </Typography>
              {index < sections.length - 1 && <Divider sx={{ my: 3 }} />}
            </Box>
          ))}

          {/* Дата и подпись */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
              textAlign: "right",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Дата последнего обновления: 01.01.2024
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`ООО "АвтоДВС"`}
            </Typography>
          </Box>
        </Box>
      </Container>
    </PublicLayout>
  );
}

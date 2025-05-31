import PublicLayout from "@/components/layouts/PublicLayout";
import CategoryPlaceholder from "@/components/ui/CategoryPlaceholder";
import CategorySidebar from "@/components/ui/CategorySidebar";
import catalogService from "@/lib/api/catalogService";
import { sortCategories } from "@/lib/utils/sortCategories";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Link,
  Skeleton,
  Box,
  CardMedia,
  useTheme,
  Breadcrumbs,
  useMediaQuery,
  Alert,
} from "@mui/material";
import { useMemo } from "react";
import useSWR from "swr";

export default function CatalogPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const { data: categories, error, isLoading } = useSWR("catalog-categories", () => catalogService.getCategories());

  const displayedCategories = useMemo(() => sortCategories(categories, true), [categories]);

  // Определяем количество колонок в зависимости от размера экрана
  const getGridColumns = () => {
    if (isMobile) return 2; // 2 колонки на мобильных
    if (isTablet) return 3; // 3 колонки на планшетах
    if (isDesktop) return 4; // 4 колонки на десктопах
    if (isLargeScreen) return 5; // 5 колонок на больших экранах
    return 3; // значение по умолчанию
  };

  const gridColumns = getGridColumns();

  return (
    <PublicLayout>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link href="/" color="inherit" underline="hover" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          Главная
        </Link>
        <Typography color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          Каталог
        </Typography>
      </Breadcrumbs>

      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mb: 4,
          fontSize: { xs: "1.5rem", sm: "2rem" },
          display: { xs: "none", sm: "block" },
        }}
      >
        Каталог запчастей
      </Typography>

      <Grid container spacing={{ xs: 1, sm: 3 }}>
        {/* Сайдбар с категориями */}
        <Grid item xs={12} md={3}>
          <CategorySidebar />
        </Grid>

        {/* Основной контент */}
        <Grid item xs={12} md={9}>
          {isLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
                gap: { xs: 1, sm: 3 },
              }}
            >
              {Array.from({ length: gridColumns * 2 }).map((_, i) => (
                <Card variant="outlined" key={`skeleton-${i}`} sx={{ height: "100%" }}>
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 1,
                    }}
                  />
                  <CardContent>
                    <Skeleton width="80%" height={24} />
                    <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mx: 2 }}>
              Ошибка загрузки категорий
            </Alert>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(4, 1fr)",
                  lg: "repeat(5, 1fr)",
                },
                gap: { xs: 1, sm: 3 },
              }}
            >
              {displayedCategories.map((category) => (
                <Card
                  component={Link}
                  href={`/catalog/${category.slug}`}
                  variant="outlined"
                  key={category.id}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "0.3s",
                    textDecoration: "none",
                    position: "relative",
                    "&:hover": {
                      boxShadow: 2,
                      borderColor: theme.palette.primary.main,
                      transform: { md: "translateY(-4px)" },
                    },
                  }}
                >
                  {/* Изображение всегда сверху */}
                  {category.img ? (
                    <CardMedia
                      component="img"
                      sx={{
                        width: "100%",
                        aspectRatio: "1/1",
                        objectFit: "cover",
                      }}
                      image={category.img}
                      alt={category.name}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        aspectRatio: "1/1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        p: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <CategoryPlaceholder size={isMobile ? 40 : 60} />
                    </Box>
                  )}

                  {/* Контент всегда под изображением */}
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      background: theme.palette.background.default,
                      p: { xs: 1, sm: 2 },
                      "&:last-child": { pb: { xs: 1, sm: 2 } },
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      gutterBottom
                      sx={{
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        fontWeight: 500,
                        color: "text.primary",
                        wordBreak: "break-word",
                      }}
                    >
                      {category.name}
                    </Typography>

                    {category.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        }}
                      >
                        {category.description}
                      </Typography>
                    )}

                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{
                        display: "block",
                        mt: "auto",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      {category._count.products} товаров
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Grid>
      </Grid>
    </PublicLayout>
  );
}

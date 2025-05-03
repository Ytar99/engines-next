import PublicLayout from "@/components/layouts/PublicLayout";
import CategoryPlaceholder from "@/components/ui/CategoryPlaceholder";
import CategorySidebar from "@/components/ui/CategorySidebar";
import catalogService from "@/lib/api/catalogService";
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
import useSWR from "swr";

export default function CatalogPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { data: categories, error, isLoading } = useSWR("catalog-categories", () => catalogService.getCategories());

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
            <Grid container spacing={{ xs: 1, sm: 3 }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Grid item xs={6} sm={4} key={`skeleton-${i}`}>
                  <Card variant="outlined" sx={{ height: "100%" }}>
                    <Skeleton variant="rectangular" height={isMobile ? 100 : 140} sx={{ borderRadius: 1 }} />
                    <CardContent>
                      <Skeleton width="80%" height={24} />
                      <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : error ? (
            <Alert severity="error" sx={{ mx: 2 }}>
              Ошибка загрузки категорий
            </Alert>
          ) : (
            <Grid container spacing={{ xs: 1, sm: 3 }}>
              {categories.map((category) => (
                <Grid item xs={6} sm={4} key={category.id}>
                  <Card
                    component={Link}
                    href={`/catalog/${category.slug}`}
                    variant="outlined"
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
                    <Box
                      sx={{
                        display: "flex",
                        flexGrow: 1,
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      {category.image ? (
                        <CardMedia
                          component="img"
                          sx={{
                            width: { xs: "100%", sm: 100 },
                            height: { xs: 240, sm: "auto" },
                            objectFit: "cover",
                          }}
                          image={category.image}
                          alt={category.name}
                        />
                      ) : (
                        <Box
                          sx={{
                            width: { xs: "100%", sm: 100 },
                            height: { xs: 240, sm: "auto" },
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
                      <CardContent
                        sx={{
                          flex: 1,
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
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            fontWeight: 500,
                            color: "text.primary",
                          }}
                        >
                          {category.name}
                        </Typography>

                        {!isMobile && category.description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 1,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
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
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </PublicLayout>
  );
}

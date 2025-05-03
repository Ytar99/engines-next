import PublicLayout from "@/components/layouts/PublicLayout";
import CategorySidebar from "@/components/ui/CategorySidebar";
import catalogService from "@/lib/api/catalogService";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Link,
  Skeleton,
  Alert,
  Breadcrumbs,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function CategoryPage() {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = router.query;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Загрузка данных
  const { data: category, error: categoryError } = useSWR(slug ? `category-${slug}` : null, () =>
    catalogService.getCategoryBySlug(slug)
  );

  const { data: productsData, error: productsError } = useSWR(slug ? `category-products-${slug}` : null, () =>
    catalogService.getCategoryProducts(slug, { page: 1, limit: 20, sortBy: "price" })
  );

  const isLoading = !category || !productsData;
  const products = productsData?.data || [];

  return (
    <PublicLayout>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, px: 1 }}>
        <Link href="/" color="inherit" underline="hover" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          Главная
        </Link>
        <Link href="/catalog" color="inherit" underline="hover" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          Каталог
        </Link>
        {category ? (
          <Typography color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            {category.name}
          </Typography>
        ) : (
          <Skeleton width={100} />
        )}
      </Breadcrumbs>

      <Grid container spacing={{ xs: 1, sm: 3 }}>
        {/* Сайдбар */}
        <Grid item xs={12} md={3}>
          <CategorySidebar />
        </Grid>

        {/* Основной контент */}
        <Grid item xs={12} md={9}>
          {categoryError ? (
            <Alert severity="error" sx={{ mb: 3, mx: 1 }}>
              Категория не найдена
            </Alert>
          ) : (
            <>
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  mb: 4,
                  px: 1,
                  fontSize: { xs: "1.5rem", sm: "2rem" },
                }}
              >
                {category?.name || <Skeleton width="60%" />}
              </Typography>

              {category?.description && (
                <Typography
                  variant="body1"
                  paragraph
                  sx={{
                    mb: 4,
                    px: 1,
                    display: { xs: "none", sm: "block" },
                  }}
                >
                  {category.description}
                </Typography>
              )}

              {productsError && (
                <Alert severity="error" sx={{ mb: 3, mx: 1 }}>
                  Ошибка загрузки товаров
                </Alert>
              )}

              {!isLoading && products.length === 0 && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary">
                    В этой категории пока нет товаров
                  </Typography>
                </Box>
              )}

              <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
                {isLoading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <Grid item xs={6} sm={4} md={3} key={i}>
                        <Card variant="outlined" sx={{ height: "100%" }}>
                          <Skeleton variant="rectangular" height={isMobile ? 150 : 200} sx={{ borderRadius: 1 }} />
                          <CardContent>
                            <Skeleton width="80%" height={24} />
                            <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  : products.map((product) => (
                      <Grid item xs={6} md={4} lg={3} key={product.id}>
                        <Card
                          component={Link}
                          href={`/products/${product.id}`}
                          variant="outlined"
                          sx={{
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            transition: "0.3s",
                            textDecoration: "none",
                            "&:hover": {
                              boxShadow: 2,
                              borderColor: theme.palette.primary.main,
                              transform: { md: "translateY(-4px)" },
                            },
                          }}
                        >
                          {product.img ? (
                            <CardMedia
                              component="img"
                              height={isMobile ? 150 : 200}
                              image={product.img}
                              alt={product.name}
                              sx={{
                                objectFit: "contain",
                                p: 2,
                                bgcolor: "background.default",
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            />
                          ) : (
                            <Box
                              height={isMobile ? 150 : 200}
                              sx={{
                                bgcolor: "background.default",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: 1,
                                borderColor: "divider",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.disabled",
                                  opacity: 0.8,
                                }}
                              >
                                Нет изображения
                              </Typography>
                            </Box>
                          )}

                          <CardContent
                            sx={{
                              flexGrow: 1,
                              p: { xs: 1, sm: 2 },
                              "&:last-child": { pb: { xs: 1, sm: 2 } },
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                fontSize: { xs: "1rem", sm: "1.1rem" },
                                "&:hover": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            >
                              {product.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}
                            >
                              Артикул: {product.article}
                            </Typography>

                            <Typography
                              variant="h6"
                              sx={{
                                mt: 2,
                                fontWeight: "bold",
                                color: theme.palette.primary.main,
                                fontSize: { xs: "1rem", sm: "1.1rem" },
                              }}
                            >
                              {product.price.toLocaleString("ru-RU")} ₽
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
              </Grid>
            </>
          )}
        </Grid>
      </Grid>
    </PublicLayout>
  );
}

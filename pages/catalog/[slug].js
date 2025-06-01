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
  Pagination,
  Stack,
} from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function CategoryPage() {
  const theme = useTheme();
  const router = useRouter();
  const { slug } = router.query;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Определяем количество колонок
  const getGridColumns = () => {
    if (isMobile) return 2;
    if (isTablet) return 3;
    if (isDesktop) return 4;
    if (isLargeScreen) return 5;
    return 3;
  };

  const gridColumns = getGridColumns();

  // Загрузка данных
  const { data: category, error: categoryError } = useSWR(slug ? `category-${slug}` : null, () =>
    catalogService.getCategoryBySlug(slug)
  );

  const {
    data: productsData,
    error: productsError,
    isValidating: isLoadingProducts,
  } = useSWR(slug ? `category-products-${slug}-${currentPage}` : null, () =>
    catalogService.getCategoryProducts(slug, {
      page: currentPage,
      limit: itemsPerPage,
      sortBy: "price",
    })
  );

  const isLoading = !category || isLoadingProducts;
  const products = productsData?.data || [];
  const pagination = productsData?.pagination || {
    page: currentPage,
    limit: itemsPerPage,
    total: 0,
    totalPages: 0,
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (slug) {
      setCurrentPage(1);
    }
  }, [slug]);

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

              {/* Используем CSS Grid для адаптивного отображения */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, 1fr)",
                    sm: "repeat(3, 1fr)",
                    md: "repeat(4, 1fr)",
                    lg: "repeat(5, 1fr)",
                  },
                  gap: { xs: 1, sm: 2, md: 3 },
                }}
              >
                {isLoading
                  ? Array.from({ length: gridColumns * 2 }).map((_, i) => (
                      <Card
                        variant="outlined"
                        key={i}
                        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
                      >
                        <Skeleton
                          variant="rectangular"
                          sx={{
                            width: "100%",
                            aspectRatio: "1/1",
                            borderRadius: 1,
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                          <Box sx={{ flexGrow: 1 }}>
                            <Skeleton width="80%" height={24} />
                            <Skeleton width="60%" height={20} sx={{ mt: 1 }} />
                          </Box>
                          <Skeleton width="50%" height={24} sx={{ mt: 2 }} />
                        </CardContent>
                      </Card>
                    ))
                  : products.map((product) => (
                      <Card
                        component={Link}
                        href={`/products/${product.id}`}
                        variant="outlined"
                        key={product.id}
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
                            sx={{
                              width: "100%",
                              aspectRatio: "1/1",
                              objectFit: "contain",
                              bgcolor: "background.default",
                            }}
                            image={product.img}
                            alt={product.name}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              aspectRatio: "1/1",
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
                            display: "flex",
                            flexDirection: "column",
                          }}
                        >
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="h6"
                              sx={{
                                fontSize: { xs: "1rem" },
                                "&:hover": {
                                  color: theme.palette.primary.main,
                                },
                                wordBreak: "break-word",
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
                          </Box>

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
                    ))}
              </Box>

              {/* Пагинация */}
              {pagination.totalPages > 1 && (
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                  <Stack spacing={2}>
                    <Pagination
                      count={pagination.totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size={isMobile ? "small" : "medium"}
                      sx={{
                        "& .MuiPaginationItem-root": {
                          color: "text.primary",
                        },
                        "& .Mui-selected": {
                          fontWeight: "bold",
                        },
                      }}
                    />
                  </Stack>
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </PublicLayout>
  );
}

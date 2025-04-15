import PublicLayout from "@/components/layouts/PublicLayout";
import catalogService from "@/lib/api/catalogService";
import { Typography, Grid, Card, CardContent, CardMedia, Link as MuiLink, Skeleton, Alert } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Загрузка данных категории
  const { data: category, error: categoryError } = useSWR(slug ? `category-${slug}` : null, () =>
    catalogService.getCategoryBySlug(slug)
  );

  // Загрузка товаров категории
  const { data: productsData, error: productsError } = useSWR(slug ? `category-products-${slug}` : null, () =>
    catalogService.getCategoryProducts(slug, {
      page: 1,
      limit: 20,
      sortBy: "price",
    })
  );

  const isLoading = !category || !productsData;
  const products = productsData?.data || [];

  return (
    <PublicLayout>
      {categoryError ? (
        <Alert severity="error">Категория не найдена</Alert>
      ) : (
        <>
          <Typography variant="h3" component="h1" gutterBottom>
            {category?.name || <Skeleton width="60%" />}
          </Typography>

          <Typography variant="body1" paragraph sx={{ mb: 4 }}>
            {category?.description || <Skeleton variant="rounded" height={24} />}
          </Typography>

          {productsError && <Alert severity="error">Ошибка загрузки товаров</Alert>}

          <Grid container spacing={3}>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} key={i}>
                    <Card variant="outlined">
                      <Skeleton variant="rectangular" height={200} />
                      <CardContent>
                        <Skeleton width="80%" />
                        <Skeleton width="60%" />
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              : products.map((product) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card
                      variant="outlined"
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        "&:hover": { boxShadow: 2 },
                      }}
                    >
                      {product.img && (
                        <CardMedia
                          component="img"
                          height="200"
                          image={product.img}
                          alt={product.name}
                          sx={{ objectFit: "contain", p: 2 }}
                        />
                      )}

                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" component={Link} href={`/products/${product.id}`} passHref>
                          <MuiLink color="inherit" underline="hover">
                            {product.name}
                          </MuiLink>
                        </Typography>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Артикул: {product.article}
                        </Typography>

                        <Typography variant="h6" sx={{ mt: 2, fontWeight: "bold" }}>
                          {product.price.toLocaleString("ru-RU")} ₽
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
          </Grid>
        </>
      )}
    </PublicLayout>
  );
}

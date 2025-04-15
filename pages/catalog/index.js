import PublicLayout from "@/components/layouts/PublicLayout";
import catalogService from "@/lib/api/catalogService";
import { Grid, Card, CardContent, Typography, Link, Skeleton, Box, CardMedia, useTheme } from "@mui/material";
import useSWR from "swr";

export default function CatalogPage() {
  const theme = useTheme();
  const { data: categories, error, isLoading } = useSWR("catalog-categories", () => catalogService.getCategories());

  return (
    <PublicLayout>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
        Каталог запчастей
      </Typography>

      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${i}`}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      ) : error ? (
        <Typography color="error">Ошибка загрузки категорий</Typography>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 2,
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Box sx={{ display: "flex", flexGrow: 1 }}>
                  <CardMedia
                    component="img"
                    sx={{
                      width: 120,
                      objectFit: "cover",
                      display: { xs: "none", sm: "block" },
                    }}
                    image="/category-placeholder.jpg"
                    alt={category.name}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Link
                      href={`/catalog/${category.slug}`}
                      color="inherit"
                      underline="none"
                      sx={{
                        "&:hover": {
                          textDecoration: "underline",
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      <Typography variant="h6" component="div" gutterBottom>
                        {category.name}
                      </Typography>
                    </Link>

                    {category.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {category.description}
                      </Typography>
                    )}

                    <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: "auto" }}>
                      {category._count.products} товаров
                    </Typography>
                  </CardContent>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </PublicLayout>
  );
}

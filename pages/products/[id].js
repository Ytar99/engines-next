import PublicLayout from "@/components/layouts/PublicLayout";
import CategorySidebar from "@/components/ui/CategorySidebar";
import catalogService from "@/lib/api/catalogService";
import {
  Typography,
  Grid,
  Box,
  Card,
  CardMedia,
  Button,
  Chip,
  Skeleton,
  Alert,
  Breadcrumbs,
  Link,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useSWR from "swr";

export default function ProductPage() {
  const theme = useTheme();
  const router = useRouter();
  const { id } = router.query;
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    data: product,
    error,
    isLoading,
  } = useSWR(id ? `product-${id}` : null, () => catalogService.getProductDetails(id));

  const [quantity, setQuantity] = useState(1);
  const maxQuantity = product?.count || 1;

  const firstCategory = product?.categories?.[0];

  useEffect(() => {
    // Сброс количества при загрузке нового товара
    setQuantity(1);
  }, [product?.id]);

  const handleQuantityChange = (newValue) => {
    if (newValue < 1) return;
    if (newValue > maxQuantity) return;
    setQuantity(newValue);
  };

  const handleAddToCart = () => {
    // Здесь логика добавления в корзину
    console.log(`Adding ${quantity} items to cart`);
    // Пример вызова:
    // addToCart(product.id, quantity);
  };

  return (
    <PublicLayout>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, px: 1 }}>
        <Link href="/" color="inherit" underline="hover">
          Главная
        </Link>
        <Link href="/catalog" color="inherit" underline="hover">
          Каталог
        </Link>
        {firstCategory && (
          <Link href={`/catalog/${firstCategory.slug}`} color="inherit" underline="hover">
            {firstCategory.name}
          </Link>
        )}
        <Typography color="text.primary">{product?.name || <Skeleton width={120} />}</Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Сайдбар */}
        <Grid item xs={12} md={3}>
          <CategorySidebar />
        </Grid>

        {/* Основной контент */}
        <Grid item xs={12} md={9}>
          {error ? (
            <Alert severity="error" sx={{ mb: 3 }}>
              Товар не найден
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {/* Изображение и основная информация */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 2,
                    bgcolor: "background.paper",
                    position: "relative",
                  }}
                >
                  {product?.img ? (
                    <CardMedia
                      component="img"
                      image={product.img}
                      alt={product.name}
                      sx={{
                        height: isMobile ? 300 : 400,
                        objectFit: "contain",
                        borderRadius: 1,
                      }}
                    />
                  ) : (
                    <Box
                      height={isMobile ? 300 : 400}
                      sx={{
                        bgcolor: "background.default",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 1,
                        border: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="body2" sx={{ color: "text.disabled", opacity: 0.8 }}>
                        Нет изображения
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Детали товара */}
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: { md: "sticky" },
                    top: 100,
                    pb: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      mb: 2,
                      fontSize: { xs: "1.5rem", sm: "2rem" },
                    }}
                  >
                    {product?.name || <Skeleton />}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      color="primary"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                      }}
                    >
                      {product?.price ? `${product.price.toLocaleString("ru-RU")} ₽` : <Skeleton width={120} />}
                    </Typography>
                    <Typography variant="body2" color={product?.count ? "success.main" : "error"} sx={{ mt: 1 }}>
                      {isLoading ? (
                        <Skeleton width={80} />
                      ) : product?.count ? (
                        `В наличии: ${product.count} шт.`
                      ) : (
                        "Нет в наличии"
                      )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1,
                      }}
                    >
                      <IconButton
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        size="small"
                        sx={{ p: 1 }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>

                      <TextField
                        value={quantity}
                        onChange={(e) => {
                          const value = Math.floor(Number(e.target.value));
                          handleQuantityChange(isNaN(value) ? 1 : value);
                        }}
                        inputProps={{
                          min: 1,
                          max: maxQuantity,
                          style: {
                            textAlign: "center",
                            width: 60,
                            padding: "8px 0",
                          },
                        }}
                        variant="standard"
                        InputProps={{
                          disableUnderline: true,
                        }}
                        sx={{
                          "& .MuiInputBase-input": {
                            fontSize: "1.1rem",
                          },
                        }}
                      />

                      <IconButton
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= maxQuantity}
                        size="small"
                        sx={{ p: 1 }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>

                    <Button
                      variant="contained"
                      size="medium"
                      disabled={!product?.count}
                      onClick={handleAddToCart}
                      sx={{
                        // py: 1.5,
                        flex: 1,
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                      }}
                    >
                      Добавить в корзину
                    </Button>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Артикул: {product?.article || <Skeleton width={100} />}
                    </Typography>
                    {product?.engine && <Typography variant="body1">Двигатель: {product.engine.name}</Typography>}
                  </Box>

                  {product?.categories?.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Категории:
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {product.categories.map((category) => (
                          <Chip
                            key={category.id}
                            label={category.name}
                            component={Link}
                            href={`/catalog/${category.slug}`}
                            clickable
                            sx={{
                              borderRadius: 1,
                              "&:hover": { bgcolor: "action.hover" },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Описание товара */}
              {product?.description && (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 3,
                      bgcolor: "background.paper",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      Описание
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "pre-wrap",
                        columnCount: { md: 2 },
                        columnGap: 4,
                      }}
                    >
                      {product.description}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
    </PublicLayout>
  );
}

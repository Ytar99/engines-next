import prisma from "@/lib/prisma";
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
  Pagination,
  Stack,
  Button,
  Divider,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import { useState } from "react";
import useSWR from "swr";
import { useMediaQuery } from "@mui/material";

export default function SearchPage({ initialData, initialPagination, queryParams }) {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Состояние для количества элементов на странице
  const [itemsPerPage, setItemsPerPage] = useState(initialPagination?.limit || 25);

  // Состояние для текущей страницы
  const [currentPage, setCurrentPage] = useState(Number(queryParams.page) || 1);

  const searchText = queryParams.text || "";

  const { data, error } = useSWR(
    [`search-products`, { ...queryParams, page: currentPage, limit: itemsPerPage }],
    ([, params]) => catalogService.searchProducts(params),
    {
      fallbackData: initialData,
      revalidateOnMount: false,
    }
  );

  const products = data?.data || [];
  const pagination = data?.pagination ||
    initialPagination || {
      page: currentPage,
      limit: itemsPerPage,
      total: 0,
      totalPages: 0,
    };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    // Обновляем URL с новым номером страницы
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = e.target.value;
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Сбрасываем на первую страницу при изменении лимита

    // Обновляем URL с новым лимитом
    router.push({
      pathname: router.pathname,
      query: { ...router.query, limit: newLimit, page: 1 },
    });
  };

  const handleClearSearch = () => {
    // Удаляем параметр text из URL
    const { text, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: { ...restQuery, page: 1 },
    });
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
        <Typography color="text.primary">Поиск</Typography>
      </Breadcrumbs>

      <Grid container spacing={{ xs: 1, sm: 3 }}>
        {/* Сайдбар с фильтрами */}
        <Grid item xs={12} md={3}>
          <CategorySidebar />
        </Grid>

        {/* Основной контент */}
        <Grid item xs={12} md={9}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 1.5,
                fontWeight: 700,
                fontSize: { xs: "1.75rem", sm: "2rem" },
              }}
            >
              Поиск товаров
            </Typography>

            {searchText && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{
                    color: "text.secondary",
                    fontSize: "1.1rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Результаты по запросу:
                  <Box
                    component="span"
                    sx={{
                      ml: 1,
                      fontWeight: 500,
                      color: "text.primary",
                      fontStyle: "italic",
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      pr: 1,
                    }}
                  >
                    {searchText}
                  </Box>
                </Typography>

                <Tooltip title="Очистить поисковый запрос" arrow>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleClearSearch}
                    startIcon={<CloseIcon fontSize="small" />}
                    sx={{
                      ml: { xs: 0, sm: 1 },
                      transition: "0.3s",
                      "& .MuiButton-startIcon": {
                        mr: 0.5,
                      },
                      "&:hover": {
                        backgroundColor: theme.palette.error.light,
                        borderColor: theme.palette.error.main,
                        color: theme.palette.error.dark,
                      },
                    }}
                  >
                    Очистить
                  </Button>
                </Tooltip>
              </Box>
            )}

            {/* Информация о результатах и выбор количества */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                {pagination.total > 0 ? `Найдено товаров: ${pagination.total}` : "Товары по вашему запросу не найдены"}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography variant="body2">Товаров на странице:</Typography>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <Select value={itemsPerPage} onChange={handleItemsPerPageChange} displayEmpty>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={25}>25</MenuItem>
                    <MenuItem value={50}>50</MenuItem>
                    <MenuItem value={100}>100</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              Ошибка загрузки результатов поиска
            </Alert>
          )}

          {/* Вертикальный список товаров */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {products.map((product) => (
              <Card
                key={product.id}
                component={Link}
                href={`/products/${product.id}`}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  textDecoration: "none",
                  transition: "0.3s",
                  "&:hover": {
                    boxShadow: 3,
                    borderColor: theme.palette.primary.main,
                  },
                }}
                variant="outlined"
              >
                {/* Изображение товара */}
                <Box
                  sx={{
                    width: { xs: "100%", sm: 200 },
                    height: { xs: 200, sm: 200 },
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.default",
                    p: 1,
                  }}
                >
                  {product.img ? (
                    <CardMedia
                      component="img"
                      sx={{
                        maxWidth: "100%",
                        maxHeight: "100%",
                        objectFit: "contain",
                      }}
                      image={product.img}
                      alt={product.name}
                    />
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      Нет изображения
                    </Typography>
                  )}
                </Box>

                {/* Информация о товаре */}
                <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
                      {product.name}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1, mb: 1 }}>
                      <Chip
                        label={`Артикул: ${product.article}`}
                        size="small"
                        variant="outlined"
                        sx={{ borderRadius: 1 }}
                      />
                      {product.engine && (
                        <Chip
                          label={product.engine.name}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ borderRadius: 1 }}
                        />
                      )}
                    </Box>

                    {product?.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                        {product.description?.substring(0, 150)}...
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <Typography
                      variant="h6"
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: "bold",
                      }}
                    >
                      {product.price.toLocaleString("ru-RU")} ₽
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Скелетоны при загрузке */}
          {!data &&
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} variant="outlined" sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, p: 2 }}>
                  <Skeleton
                    variant="rectangular"
                    sx={{ width: { xs: "100%", sm: 200 }, height: 200, borderRadius: 1 }}
                  />
                  <Box sx={{ flex: 1, ml: { sm: 2 }, mt: { xs: 2, sm: 0 } }}>
                    <Skeleton width="60%" height={32} />
                    <Skeleton width="40%" height={24} sx={{ mt: 1 }} />
                    <Skeleton width="80%" height={20} sx={{ mt: 2 }} />
                    <Skeleton width="80%" height={20} />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                      <Skeleton width="30%" height={32} />
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}

          {/* Пагинация */}
          {pagination.totalPages > 1 && (
            <Box
              sx={{
                mt: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Pagination
                count={pagination.totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
                sx={{ alignSelf: "center" }}
              />

              <Typography variant="body2" color="text.secondary">
                Страница {currentPage} из {pagination.totalPages}
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </PublicLayout>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;

  // Извлекаем и обрабатываем параметры
  const text = query.text || null;
  const page = Number(query.page) || 1;
  const limit = Math.min(100, Number(query.limit) || 25);
  const sortBy = query.sortBy || "name";
  const sortOrder = query.sortOrder || "asc";
  const engineId = query.engineId ? parseInt(query.engineId) : null;
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : null;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : null;

  // Базовый объект пагинации
  const fallbackPagination = {
    page,
    limit,
    total: 0,
    totalPages: 0,
  };

  try {
    // Формируем условия для фильтрации
    const where = {
      AND: [
        text
          ? {
              OR: [{ name: { contains: text } }, { article: { contains: text } }],
            }
          : {},
        engineId ? { engineId } : {},
        minPrice ? { price: { gte: minPrice } } : {},
        maxPrice ? { price: { lte: maxPrice } } : {},
      ],
    };

    // Выполняем запросы к базе данных
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          engine: true,
          categories: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Формируем ответ
    const response = {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    return {
      props: {
        initialData: JSON.parse(JSON.stringify(response)),
        initialPagination: JSON.parse(JSON.stringify(response.pagination)),
        queryParams: JSON.parse(JSON.stringify(query)),
      },
    };
  } catch (error) {
    console.error("Search page error:", error);
    return {
      props: {
        initialData: { data: [], pagination: fallbackPagination },
        initialPagination: fallbackPagination,
        queryParams: query,
        error: "Ошибка загрузки результатов поиска",
      },
    };
  }
}

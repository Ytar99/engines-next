import catalogService from "@/lib/api/catalogService";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Skeleton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function CategorySidebar() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { slug: currentSlug } = router.query;

  const { data: categories, isLoading, error } = useSWR("catalog-categories", () => catalogService.getCategories());

  return (
    <Box
      sx={{
        border: 1,
        borderRadius: 1,
        borderColor: "divider", // MUI bug
        p: 2,

        mb: { xs: 3, md: 0 },
        position: { xs: "static", md: "sticky" },
        top: 16,
        maxHeight: { xs: "none", md: "calc(100dvh - 200px)" },
        overflowY: "auto",
        width: "100%",
      }}
      // style={{ borderColor: theme.palette.divider + " !important" }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 500,
          display: { xs: "none", md: "block" },
        }}
      >
        Категории
      </Typography>

      {error ? (
        <Typography color="error">Ошибка загрузки</Typography>
      ) : (
        <List
          disablePadding
          sx={{
            display: { xs: "flex", md: "block" },
            flexDirection: { xs: "row", md: "column" },
            overflowX: { xs: "auto", md: "hidden" },
          }}
        >
          {isLoading
            ? [1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{
                    minWidth: { xs: 150, md: "auto" },
                    mr: { xs: 1, md: 0 },
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    height={40}
                    sx={{
                      borderRadius: 1,
                      width: { xs: 150, md: "100%" },
                    }}
                  />
                </Box>
              ))
            : categories?.map((category) => (
                <ListItem
                  key={category.id}
                  disablePadding
                  sx={{
                    minWidth: { xs: 150, md: "auto" },
                    mr: { xs: 1, md: 0 },
                    // flexShrink: 0,
                  }}
                >
                  <ListItemButton
                    component={Link}
                    href={`/catalog/${category.slug}`}
                    replace
                    sx={{
                      borderRadius: 1,
                      flexDirection: "column",
                      alignItems: { xs: "center", md: "flex-start" },
                      px: { xs: 2, md: 2 },
                      py: { xs: 1.5, md: 1 },
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "action.selected",
                        "&:hover": {
                          backgroundColor: "action.selected",
                        },
                      },
                    }}
                    selected={category.slug === currentSlug}
                  >
                    <ListItemText
                      primary={category.name}
                      primaryTypographyProps={{
                        variant: "body2",
                        sx: {
                          textAlign: { xs: "center", md: "left" },
                          fontWeight: { xs: 500, md: "normal" },
                        },
                      }}
                    />
                    {isMobile && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                        {category._count?.products || 0} товар(-ов)
                      </Typography>
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
        </List>
      )}
    </Box>
  );
}

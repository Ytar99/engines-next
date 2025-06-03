import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { Button, Box, Chip } from "@mui/material";
import { Add as AddIcon, LinkOff } from "@mui/icons-material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";
import { useEntity } from "@/lib/hooks/useEntity";
import categoryService from "@/lib/api/categoryService";

const columns = [
  { field: "id", header: "ID", width: 70 },
  { field: "name", header: "Название", flex: 1 },
  {
    field: "slug",
    header: "URL-адрес",
    render: (_, row) => <Chip label={row.slug} size="small" />,
  },
  {
    field: "productsCount",
    header: "Товары",
    width: 120,
    render: (_, row) => row.products?.length || 0,
  },
];

const initialFilters = {};

const CategoriesPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const rows = useFetchForTable({ initialFilters, getAll: categoryService.getAll });
  const deletedEntity = useEntity(categoryService);

  const [_, cancelDebounce] = useDebounce(() => rows.setSearch(searchTerm), 800, [searchTerm]);

  const handleDelete = () => {
    deletedEntity.deleteItem(selectedForDelete?.id, () => {
      rows.refetch();
    });

    setSelectedForDelete(null);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
  };
  useEffect(() => {
    cancelDebounce();
  }, [cancelDebounce]);

  return (
    <CrmLayout>
      <DataTableFilters
        filtersConfig={[]}
        initialFilters={initialFilters}
        searchTerm={searchTerm}
        onFilterChange={rows.setFilters}
        onSearchChange={handleSearchChange}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
        <Button variant="contained" startIcon={<AddIcon />} href="/crm/categories/create">
          Новая категория
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={rows.data}
        pagination={rows.pagination}
        loading={rows.loading}
        getEditUrl={(id) => `/crm/categories/${id}/edit`}
        onPageChange={(newPage) => rows.setPage(newPage + 1)}
        onRowsPerPageChange={rows.setLimit}
        onDelete={setSelectedForDelete}
        // additionalActions={[
        //   {
        //     icon: <LinkOff fontSize="small" />,
        //     tooltip: "Отвязать от всех товаров",
        //     onClick: setSelectedForUnlink,
        //     color: "warning",
        //   },
        // ]}
      />

      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        title="Удаление категории"
        contentText={`Удалить категорию "${selectedForDelete?.name}"?`}
        warningText={selectedForDelete?.productsCount > 0 ? "Внимание! В категории есть привязанные товары" : null}
      />

      {/* <ConfirmationDialog
        open={!!selectedForUnlink}
        onClose={() => setSelectedForUnlink(null)}
        onConfirm={handleUnlinkAll}
        title="Отвязка категории"
        contentText={`Отвязать категорию "${selectedForUnlink?.name}" от всех товаров?`}
        confirmText="Отвязать"
        confirmColor="warning"
      /> */}
    </CrmLayout>
  );
};

export default CategoriesPage;

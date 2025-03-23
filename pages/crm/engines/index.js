// pages/crm/engines/index.js
import { useEffect, useState } from "react";
import { useDebounce } from "react-use";
import { Button, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useFetchForTable } from "@/lib/hooks/useFetchForTable";
import engineService from "@/lib/api/engineService";
import { useEntity } from "@/lib/hooks/useEntity";

const initialFilters = { engineId: "" };

const columns = [
  { field: "id", header: "ID" },
  { field: "name", header: "Название" },
  {
    field: "productsCount",
    header: "Товары",
    render: (_, row) => row.products?.length || 0,
  },
];

const EnginesPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const rows = useFetchForTable({ initialFilters, getAll: engineService.getAll });
  const deletedEntity = useEntity(engineService);

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
      {rows.error && <div>Ошибка двигателей: {rows.error}</div>}

      <DataTableFilters
        filtersConfig={[]}
        initialFilters={initialFilters}
        searchTerm={searchTerm}
        onFilterChange={rows.setFilters}
        onSearchChange={handleSearchChange}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          href="/crm/engines/create"
          disabled={rows.loading}
        >
          Создать двигатель
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={rows.data}
        pagination={rows.pagination}
        loading={rows.loading || deletedEntity.loading}
        getEditUrl={(engineId) => `/crm/engines/${engineId}/edit`}
        onPageChange={(newPage) => rows.setPage(newPage + 1)}
        onRowsPerPageChange={rows.setLimit}
        onDelete={setSelectedForDelete}
      />

      <ConfirmationDialog
        open={!!selectedForDelete}
        onClose={() => setSelectedForDelete(null)}
        onConfirm={handleDelete}
        contentText={`Вы уверены, что хотите удалить двигатель "[${selectedForDelete?.id}] ${selectedForDelete?.name}"?`}
      />
    </CrmLayout>
  );
};

export default EnginesPage;

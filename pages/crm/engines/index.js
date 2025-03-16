// pages/crm/engines/index.js
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDebounce } from "react-use";
import { Button, Box } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import { useEngines } from "@/lib/hooks/useEngines";
import { useEngine } from "@/lib/hooks/useEngine";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";

const initialFilters = { engineId: "" };

const EnginesPage = () => {
  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const engines = useEngines();
  const deletedEngine = useEngine(initialFilters);

  const [_, cancelDebounce] = useDebounce(
    () => {
      engines.setSearch(searchTerm); // Передаем новое значение поиска в хук
    },
    800,
    [searchTerm]
  );

  const filtersConfig = [];

  const columns = [
    { field: "id", header: "ID" },
    { field: "name", header: "Название" },
    {
      field: "productsCount",
      header: "Продукты",
      render: (_, row) => row.products?.length || 0,
    },
  ];

  const handleDelete = () => {
    deletedEngine.deleteEngine(selectedForDelete?.id, () => {
      toast.success("Двигатель удалён");
      engines.refetch();
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
        filtersConfig={filtersConfig}
        initialFilters={initialFilters}
        searchTerm={searchTerm}
        onFilterChange={engines.setFilters}
        onSearchChange={handleSearchChange}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          href="/crm/engines/create"
          disabled={engines.loading}
        >
          Создать двигатель
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={engines.engines}
        pagination={engines.pagination}
        loading={engines.loading || deletedEngine.loading}
        getEditUrl={(engineId) => `/crm/engines/${engineId}/edit`}
        onPageChange={engines.setPage}
        onRowsPerPageChange={engines.setLimit}
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

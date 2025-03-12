// pages/crm/users/index.js

import { useState } from "react";
import CrmLayout from "@/components/layouts/CrmLayout";
import { DataTableFilters } from "@/components/crm/common/DataTableFilters";
import { DataTable } from "@/components/crm/common/DataTable";
import { ConfirmationDialog } from "@/components/crm/common/ConfirmationDialog";
import { useProducts } from "@/lib/hooks/useProducts";

const initialFilters = { engineId: "" };

const ProductsPage = () => {
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { products, pagination, loading, error, setPage, setLimit, setFilters, setSearch } = useProducts();

  const filtersConfig = [
    {
      type: "select",
      name: "engineId",
      label: "Двигатель",
      options: [
        { value: "", label: "Все" },
        { value: "1", label: "V8" },
        { value: "2", label: "V6" },
      ],
    },
  ];

  const columns = [
    { field: "article", header: "Артикул" },
    { field: "name", header: "Название" },
    {
      field: "price",
      header: "Цена",
      render: (value) => `${value.toLocaleString()} ₽`,
    },
    { field: "count", header: "Остаток" },
  ];

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
    setSearch(searchTerm); // Передаем новое значение поиска в хук
  };

  return (
    <CrmLayout>
      {error && <div>{error}</div>} {/* Отображение ошибки, если есть */}
      <DataTableFilters
        filtersConfig={filtersConfig}
        filters={initialFilters}
        onFilterChange={setFilters}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange} // Передаем обработчик изменений поиска
      />
      <DataTable
        columns={columns}
        data={products}
        pagination={pagination}
        loading={loading}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
        onDelete={setSelectedId}
      />
      <ConfirmationDialog
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        onConfirm={() => {
          deleteProduct(selectedId);
          setSelectedId(null);
        }}
        contentText={`Вы уверены, что хотите удалить продукт #${selectedId}?`}
      />
    </CrmLayout>
  );
};

export default ProductsPage;

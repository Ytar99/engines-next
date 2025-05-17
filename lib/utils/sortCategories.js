export function sortCategories(categories = [], filterZeroes = false) {
  // Приоритетные категории
  const priority = { all: 1, original: 2 };

  return categories
    ?.filter((category) => {
      if (!filterZeroes) return true;
      return category._count.products > 0;
    })
    .sort((a, b) => {
      // Получаем приоритет для каждого элемента
      const aPriority = priority[a.slug] || 3;
      const bPriority = priority[b.slug] || 3;

      // Сначала сортируем по приоритету
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      return a.name.localeCompare(b.name);
    });
}

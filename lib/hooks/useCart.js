// hooks/useCart.js
import useSWR from "swr";
import cartService from "@/lib/api/cartService";

export default function useCart() {
  const { data, mutate, isLoading, error } = useSWR("cart", () => cartService.getCart());

  return {
    total: data?.totalPrice || 0,
    count: data?.totalItems || 0,
    items: data?.items || [],
    isLoading,
    error,
    mutate,
  };
}

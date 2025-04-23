import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios/axiosInstance";
import type { sellers as Seller, shops as Shop } from "@prisma/client";

//fetch user
const fetchSeller = async (): Promise<Seller & { shop: Shop } > => {
  const res = await axiosInstance.get("/api/get-logged-in-seller");
  return res.data.data
};

const useSeller = () => {
  const {
    data: seller,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["get-seller"],
    queryFn: fetchSeller,
    staleTime: 5 * 60 * 1000, //cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  });

  return { seller, isLoading, isError, refetch };
};


export default useSeller
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../axios/axiosInstance";

//fetch user
const fetchUser = async () => {
  const res = await axiosInstance.get("/api/logged-in-user");
  return res.data.user;
};

const useUser = () => {
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["get-user"],
    queryFn: fetchUser,
    staleTime: 5 * 60 * 1000, //cache for 5 minutes
    retry: 1,
    refetchOnWindowFocus: true,
  });

  return { user, isLoading, isError, refetch };
};


export default useUser
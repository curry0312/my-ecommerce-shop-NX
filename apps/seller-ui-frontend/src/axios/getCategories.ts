import axiosInstance from "./axiosInstance";

type GetCategoriesResponse = {
    id: number;
    categories: string[]
};

export const getCategories = async (): Promise<GetCategoriesResponse> => {
  const res = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_URL}/product/api/get-categories`,
    {
      withCredentials: true,
    }
  );
  return res.data.data;
};

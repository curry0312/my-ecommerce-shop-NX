import axiosInstance from "./axiosInstance";

type DeleteProductParams = {
  productId: string;
};

type DeleteProductResponse = {
  message: string;
};

export const deleteProduct = async ({
  productId,
}: DeleteProductParams): Promise<DeleteProductResponse> => {
  const res = await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/product/api/delete-product/${productId}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

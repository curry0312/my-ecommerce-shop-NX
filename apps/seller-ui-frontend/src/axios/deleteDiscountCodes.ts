import axiosInstance from "./axiosInstance";

type DeleteDiscountCodeParams = {
  discountCodeId: string;
};

type DeleteDiscountCodeResponse = {
  message: string;
};

export const deleteDiscountCode = async ({
  discountCodeId,
}: DeleteDiscountCodeParams): Promise<DeleteDiscountCodeResponse> => {
    console.log("discountCodeId",discountCodeId);
  const res = await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_API_URL}/product/api/delete-discountCode/${discountCodeId}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

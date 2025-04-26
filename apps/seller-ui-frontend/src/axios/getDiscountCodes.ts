import axiosInstance from "./axiosInstance";
import type { discount_codes } from "@prisma/client";

// type CreateCategoriesParams = {
//   sellerId: string;
// };

type GetDiscountCodesResponse = {
  message: string;
  data: discount_codes[];
};

export const getDiscountCodes = async (): Promise<GetDiscountCodesResponse> => {
  const res = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_URL}/product/api/get-discountCodes`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

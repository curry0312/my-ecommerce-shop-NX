import axiosInstance from "./axiosInstance";
import type { discount_codes } from "@prisma/client";

type CreateDiscountCodeResponse = {
  message: string;
  data: discount_codes;
}

export type CreateDiscountCodeParams = {
  title: string;
  discountCode: string;
  discountValue: string;
  discountType: string
};

export const createDiscountCode = async ({
  title,
  discountCode,
  discountValue,
  discountType
}: CreateDiscountCodeParams): Promise<CreateDiscountCodeResponse> => {
  const res = await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_API_URL}/product/api/create-discountCode`,
    {
      title,
      discountCode,
      discountValue,
      discountType
    },
    {
      withCredentials: true,
    }
  );
  return res.data
};

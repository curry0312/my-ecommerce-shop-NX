import { discount_codes } from "@prisma/client";
import axiosInstance from "./axiosInstance";

type GetSpecificDiscountCodeParams = {
    discountCode: string;
};

type GetSpecificDiscountCodeResponse = {
    message: string;
    data: discount_codes;
};

export const getSpecificDiscountCode = async ({
  discountCode,
}: GetSpecificDiscountCodeParams): Promise<GetSpecificDiscountCodeResponse> => {
  const res = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_URL}/product/api/get-discountCode/${discountCode}`,
    {
      withCredentials: true,
    }
  );
  return res.data;
};

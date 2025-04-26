import axiosInstance from "./axiosInstance";
import type { products as Products } from "@prisma/client";

type GetProductsResponse = {
    message: string;    
    data: Products[];
}

export const getProducts = async (): Promise<GetProductsResponse> => {
    const res = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_URL}/product/api/get-products`,
        {
            withCredentials: true,
        }
    );
    return res.data;
};
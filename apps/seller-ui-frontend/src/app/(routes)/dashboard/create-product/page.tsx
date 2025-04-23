"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const CreateProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  image: z.string().min(1, "Image is required"),
  category: z.string().min(1, "Category is required"),
  sellerId: z.string().min(1, "Seller ID is required"),
})


export default function page() {
  // const { register, handleSubmit } = useForm({
  //   resolver: zodResolver(CreateProductSchema),
  // });

  const onSubmit = async (data: any) => {
    console.log(data);
  };
  return (
    <form
      onSubmit={() => {}}
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    ></form>
  );
}

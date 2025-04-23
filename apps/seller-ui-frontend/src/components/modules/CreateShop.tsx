import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { CATEGORIES } from "../../utils/categories";
import { useRouter } from "next/navigation";

type CreateShopProps = {
  sellerId: string;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
};

const CreateShopFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().min(1, "Bio is required"),
  address: z.string().min(1, "Address is required"),
  openingHours: z.string().min(1, "Opening hours is required"),
  category: z.string().min(1, "Category is required"),
  website: z
    .union([z.string().url("Invalid URL format"), z.literal("")])
    .optional(),
});

type CreateShopFormSchemaType = z.infer<typeof CreateShopFormSchema>;

export default function CreateShop({
  sellerId,
}: // setActiveStep,
CreateShopProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateShopFormSchema),
  });

  const router = useRouter();

  const createShopMutation = useMutation({
    mutationFn: async (
      data: CreateShopFormSchemaType & { sellerId: string }
    ) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/create-shop`,
        data,
        {
          withCredentials: true,
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      router.push("/login");
      // setActiveStep(3);
    },
  });

  const onSubmit = async (data: CreateShopFormSchemaType) => {
    console.log(data);
    const createShopData = { ...data, sellerId };
    createShopMutation.mutate(createShopData);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <h3 className="text-2xl font-semibold text-center mb-4">
        Create your account
      </h3>

      <label htmlFor="Name">Name *</label>
      <input
        type="text"
        id="name"
        placeholder="Example"
        {...register("name")}
        className="w-full p-2 border border-gray-300 outline-0 rounded-md my-1"
      />
      {errors.name && (
        <p className="text-red-500 text-sm">{errors.name.message}</p>
      )}

      <label htmlFor="bio">Bio *</label>
      <input
        id="bio"
        placeholder="Hello world"
        {...register("bio")}
        className="w-full p-2 border border-gray-300 outline-0 rounded-md my-1"
      />
      {errors.bio && (
        <p className="text-red-500 text-sm">{errors.bio.message}</p>
      )}

      <label htmlFor="email">Address *</label>
      <input
        type="text"
        id="phoneNumber"
        placeholder="location"
        {...register("address")}
        className="w-full p-2 border border-gray-300 outline-0 rounded-md my-1"
      />
      {errors.address && (
        <p className="text-red-500 text-sm">{errors.address.message}</p>
      )}

      <label htmlFor="email">OpeningHours *</label>
      <div className="relative">
        <input
          id="openingHours"
          placeholder="10:00 - 20:00"
          {...register("openingHours")}
          className="w-full p-2 border border-gray-300 outline-0 rounded-md my-1"
        />
      </div>
      {errors.openingHours && (
        <p className="text-red-500 text-sm">{errors.openingHours.message}</p>
      )}

      <label htmlFor="email">Category *</label>
      <select
        {...register("category")}
        className="w-full p-2 border border-gray-300 outline-0 rounded-md my-1"
      >
        <option value="">Select Category</option>
        {CATEGORIES.map((country) => (
          <option key={country.value} value={country.value}>
            {country.label}
          </option>
        ))}
      </select>
      {errors.category && (
        <p className="text-red-500 text-sm">{errors.category.message}</p>
      )}

      <label htmlFor="website">Website</label>
      <div className="relative">
        <input
          id="website"
          placeholder="example.com"
          {...register("website")}
          className="w-full p-2 border border-gray-300 outline-0 rounded-md my-1"
        />
      </div>
      {errors.website && (
        <p className="text-red-500 text-sm">{errors.website.message}</p>
      )}

      <button
        type="submit"
        disabled={createShopMutation.isPending}
        className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-md mt-4"
      >
        {createShopMutation.isPending ? "Processing..." : "Create Shop"}
      </button>
    </form>
  );
}

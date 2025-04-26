"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { z } from "zod";
import ImagePlaceHolder from "apps/seller-ui-frontend/src/components/ImagePlaceHolder";
import { useState } from "react";
import Input from "packages/components/Input";
import CustomSpecifications from "packages/components/CustomSpecifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "apps/seller-ui-frontend/src/axios/getCategories";
import { getDiscountCodes } from "apps/seller-ui-frontend/src/axios/getDiscountCodes";
import { createProduct } from "apps/seller-ui-frontend/src/axios/createProduct";
import toast from "react-hot-toast";

const CreateProductSchema = z.object({
  title: z.string().min(1, "Name is required"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Price must be a number",
    })
    .refine((val) => Number(val) >= 0, {
      message: "Price cannot be negative",
    }),

  category: z.string().min(1, "Category is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .refine(
      (val) => val.trim().split(/\s+/).length <= 150,
      (val) => ({
        message: `Description cannot exceed 150 words (Current: ${
          val.trim().split(/\s+/).length
        })`,
      })
    ),
  tags: z
    .string()
    .transform((val) =>
      val
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    )
    .refine((arr) => arr.length <= 5, {
      message: "Maximum of 5 tags allowed",
    })
    .optional(),

  images: z
    .array(z.object({ file: z.instanceof(File), url: z.string() }))
    .refine((arr) => arr.length > 0, {
      message: "At least one image is required",
    }),

  custom_specifications: z.array(
    z
      .object({
        name: z.string(),
        value: z.string(),
      })
      .optional()
      .superRefine((data, ctx) => {
        if (!data) return;
        const { name, value } = data;

        if ((name && !value) || (!name && value)) {
          ctx.addIssue({
            path: [], // 留空表示整個物件
            code: z.ZodIssueCode.custom,
            message: "Name and value must both be filled or both empty",
          });
        }
      })
  ),
  cash_on_delivery: z.string(),

  stock: z
    .string()
    .min(1, "Stock is required")
    .refine((val) => Number(val) > 0, {
      message: "Stock must be greater than 0",
    }),

  discountCode: z.string().optional(),
});

export type CreateProductSchemaType = z.infer<typeof CreateProductSchema>;

export default function page() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      images: [],
      custom_specifications: [],
      cash_on_delivery: "yes",
      price: "",
      category: "",
      stock: "",
      discountCode: "",
    },
  });

  const queryClient = useQueryClient();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);

  const {
    data,
    isLoading: categoriesLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: discountCodes, isLoading: discountCodesLoading } = useQuery({
    queryKey: ["discount-codes"],
    queryFn: getDiscountCodes,
    staleTime: 5 * 60 * 1000, //cache for 5 minutes
    retry: 1,
  });

  const categories = data?.categories || [];

  const createProductMutation = useMutation({
    mutationFn: (data: CreateProductSchemaType) => createProduct(data),
    onSuccess: (data) => {
      console.log("data create successfully", data);
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      reset();
      setImages([]);
    },
  });

  const handleImageChange = (file: File | null) => {
    const updatedImages = [...images];
    updatedImages.push({ file: file!, url: URL.createObjectURL(file!) });
    setImages(updatedImages);
    setValue("images", updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    setValue("images", updatedImages);
  };

  const onSubmit = async (data: any) => {
    console.log(data);
    createProductMutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (onerror) => console.log(onerror))}
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"
    >
      <h2 className="text-2xl py-2 font-semibold font-poppins text-white">
        Create Product
      </h2>
      <div className="flex items-center">
        <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
        <KeyboardArrowRightIcon />
        <span>Create Product</span>
      </div>

      {/*Content layout*/}
      <div className="py-4 w-full flex gap-6">
        <div className="w-[35%]">
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.map((image, index) => (
              <ImagePlaceHolder
                key={index}
                setOpenImageModal={setOpenImageModal}
                defaultImage={image.url}
                size="765 x 850"
                index={index}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
            {images.length < 5 && (
              <ImagePlaceHolder
                defaultImage={null}
                size="765 * 850"
                index={null}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
                setOpenImageModal={setOpenImageModal}
              />
            )}
            {errors.images && (
              <span className="text-red-500">{errors.images.message}</span>
            )}
          </div>
        </div>
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6">
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter Product Title"
                {...register("title")}
              />
              {errors.title && (
                <span className="text-red-500">{errors.title.message}</span>
              )}

              <div className="mt-2">
                <Input
                  label="Price *"
                  placeholder="Enter Product Price"
                  {...register("price")}
                />
                {errors.price && (
                  <span className="text-red-500">{errors.price.message}</span>
                )}
              </div>

              <div className="mt-2">
                <Input
                  type="textarea"
                  rows={7}
                  cols={10}
                  label="Short Description * (Max 150 words) *"
                  placeholder="Enter product description for quick view"
                  {...register("description", {
                    required: "Description is required",
                    validate: (value) => {
                      const wordCount = value.trim().split(/\s+/).length;
                      return (
                        wordCount <= 150 ||
                        `Description cannot exceed 150 words (Current: ${wordCount})`
                      );
                    },
                  })}
                />
              </div>

              <div className="mt-2">
                <Input
                  label="Tags * (optional)"
                  placeholder="apple, flagship"
                  {...register("tags", {
                    required: "Separate related product tags with a comma.",
                  })}
                />

                {errors.tags && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tags.message as string}
                  </p>
                )}
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash on delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full border outline-none border-gray-300 bg-transparent p-2 rounded-md"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>
            </div>

            <div className="w-2/4 flex flex-col">
              <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              {categoriesLoading ? (
                <p>Loading categories</p>
              ) : isError ? (
                <p>Failed to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <>
                      <select
                        {...field}
                        className="w-full border outline-none border-gray-300 bg-transparent p-2 rounded-md"
                      >
                        <option value="" className="bg-black">
                          Select Category *
                        </option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className="text-red-500 mt-1">
                          {errors.category.message as string}
                        </p>
                      )}
                    </>
                  )}
                />
              )}

              <div className="mt-2">
                <Input
                  label="Stock *"
                  placeholder="Enter Product Stock"
                  {...register("stock")}
                />
                {errors.stock && (
                  <span className="text-red-500">{errors.stock.message}</span>
                )}
              </div>

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount code * (optional)
                </label>
                {discountCodesLoading ? (
                  <p>Loading discount codes</p>
                ) : (
                  <select
                    {...register("discountCode")}
                    className="w-full border outline-none border-gray-300 bg-transparent p-2 rounded-md"
                  >
                    <option value="" className="bg-black">
                      Select Discount Code
                    </option>
                    {discountCodes?.data.map((code) => (
                      <option
                        key={code.id}
                        value={code.discountCode}
                        className="bg-black"
                      >
                        {code.title}
                      </option>
                    ))}
                  </select>
                )}
                {errors.discountCode && (
                  <span className="text-red-500">
                    {errors.discountCode.message}
                  </span>
                )}
              </div>

              <div className="mt-auto flex justify-end">
                <button
                  type="submit"
                  disabled={createProductMutation.isPending}
                  className="bg-[#3489FF] text-white py-2 px-4 rounded-md"
                >
                  {createProductMutation.isPending ? "Creating..." : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

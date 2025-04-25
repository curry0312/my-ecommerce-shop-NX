"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { z } from "zod";
import ImagePlaceHolder from "apps/seller-ui-frontend/src/components/ImagePlaceHolder";
import { useState } from "react";
import Input from "packages/components/Input";
import CustomSpecifications from "packages/components/CustomSpecifications";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "apps/seller-ui-frontend/src/axios/getCategories";

const CreateProductSchema = z.object({
  title: z.string().min(1, "Name is required"),
  price: z.number().min(1, "Price is required"),
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
    .min(1, "At least one tag is required")
    .max(5, "Maximum of 5 tags allowed"),
  images: z
    .array(z.union([z.instanceof(File), z.null()]))
    .refine((arr) => arr.some((file) => file instanceof File), {
      message: "At least one image is required",
    }),
  custom_specifications: z
    .array(
      z.object({
        name: z.string().min(1, "Specification name is required"),
        value: z.string().min(1, "Specification value is required"),
      })
    )
    .min(1, "At least one specification is required"),
  cash_on_delivery: z.string(),
  stock: z.number().min(1, "Price is required"),
});

export default function page() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      images: [null],
      custom_specifications: [{ name: "", value: "" }],
      cash_on_delivery: "yes",
      price: 0,
      category: "",
    },
  });

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [images, setImages] = useState<(File | null)[]>([null]);
  const [loading, setLoading] = useState(false);

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
  console.log("data", data);

  const categories = data?.categories || [];
  console.log("categories", categories);

  const handleImageChange = (file: File | null, index: number) => {
    const updatedImages = [...images];

    updatedImages[index] = file;

    if (index === images.length - 1 && images.length < 8) {
      updatedImages.push(null);
    }

    setImages(updatedImages);
    setValue("images", updatedImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prevImages) => {
      let updatedImages = [...prevImages];

      if (index === -1) {
        updatedImages[0] = null;
      } else {
        updatedImages.splice(index, 1);
      }

      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      return updatedImages;
    });

    setValue("images", images);
  };

  const onSubmit = async (data: any) => {
    console.log(data);
  };
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
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
          {images.length > 0 && (
            <ImagePlaceHolder
              defaultImage={null}
              size="765 * 850"
              small={false}
              index={null}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
              setOpenImageModal={setOpenImageModal}
            />
          )}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                key={index}
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"
                small
                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
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
                  label="Tags *"
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
                <label>Cash on delivery *</label>
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

            <div className="w-2/4">
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
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

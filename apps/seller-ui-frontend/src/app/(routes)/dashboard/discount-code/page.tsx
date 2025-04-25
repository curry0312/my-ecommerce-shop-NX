"use client";

import React, { useMemo, useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getDiscountCodes } from "apps/seller-ui-frontend/src/axios/getDiscountCodes";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  createDiscountCode,
  CreateDiscountCodeParams,
} from "apps/seller-ui-frontend/src/axios/createDiscountCodes";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import Input from "packages/components/Input";
import { deleteDiscountCode } from "apps/seller-ui-frontend/src/axios/deleteDiscountCodes";

const CreateDiscountCodeSchema = z.object({
  title: z.string().min(1, "Name is required"),
  discountCode: z.string().min(1, "Discount code is required"),
  discountValue: z.string().min(1, "Discount value is required"),
  discountType: z.string(),
});

type CreateDiscountCodeSchemaType = z.infer<typeof CreateDiscountCodeSchema>;

export default function page() {
  const [showModal, setShowModal] = useState(false);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm({
    resolver: zodResolver(CreateDiscountCodeSchema),
    defaultValues: {
      title: "",
      discountCode: "",
      discountValue: "",
      discountType: "percentage",
    },
  });

  const {
    data: discountCodes,
    isLoading,
  } = useQuery({
    queryKey: ["discount-codes"],
    queryFn: getDiscountCodes,
    staleTime: 5 * 60 * 1000, //cache for 5 minutes
    retry: 1,
  });
  console.log("discountCodes", discountCodes);

  const discountCodesData = useMemo(
    () => discountCodes?.data || [],
    [discountCodes]
  );

  const createDiscountMutation = useMutation({
    mutationFn: (data: CreateDiscountCodeParams) => createDiscountCode(data),
    onSuccess: (data) => {
      console.log("data create successfully", data);
      queryClient.invalidateQueries({ queryKey: ["discount-codes"] });
      reset();
    },
  });

  const deleteDiscountMutation = useMutation({
    mutationFn: (id: string) => deleteDiscountCode({ discountCodeId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discount-codes"] });
    },
  });

  const handleDeleteClick = (id: string) => {
    console.log(id);
    deleteDiscountMutation.mutate(id);
    toast.success("Discount code deleted successfully");
  };

  const onSubmit = (data: CreateDiscountCodeSchemaType) => {
    console.log(data);
    if (discountCodesData?.length >= 10)
      return toast.error("You can't create more than 10 discount codes");

    createDiscountMutation.mutate({
      title: data.title,
      discountCode: data.discountCode,
      discountValue: data.discountValue,
      discountType: data.discountType,
    });

    return
  };

  return (
    <div className="w-full min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <AddCircleOutlineIcon />
          Create Discount
        </button>
      </div>

      <div className="flex items-center text-white">
        <Link href={"/dashboard"} className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <KeyboardArrowRightIcon />
        <span>Discount Codes</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Discount Codes
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Value</th>
                <th className="p-3 text-left">Code</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discountCodesData?.map((discountCode) => (
                <tr
                  key={discountCode.id}
                  className="border-b border-gray-800 hover:bg-gray-800 transition"
                >
                  <td className="p-3">{discountCode.title}</td>
                  <td className="p-3">
                    {discountCode.discountType === "percentage"
                      ? discountCode.discountValue + "%"
                      : "$" + discountCode.discountValue}
                  </td>
                  <td className="p-3">{discountCode.discountCode}</td>
                  <td className="p-3">{discountCode.discountType}</td>
                  <td className="p-3">
                    <button
                      onClick={() => handleDeleteClick(discountCode.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <DeleteIcon />
                    </button>
                  </td>
                  {/* <td className="p-3">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                      Edit
                    </button>
                  </td> */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && discountCodesData?.length === 0 && (
          <span className="text-gray-400 text-center w-full pt-4 block">
            No Discount Codes Available!
          </span>
        )}
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-semibold text-white">
                Create Discount
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-300 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Title *"
                placeholder="Enter title"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
              <div className="mt-4">
                <label className="block font-semibold text-gray-300 mb-1">
                  Discount Type
                </label>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none p-2 border-gray-700 bg-transparent rounded-md text-gray-300 "
                    >
                      <option value={"percentage"}>Percentage (%)</option>
                      <option value={"flat"}>Flat Amount ($)</option>
                    </select>
                  )}
                />
              </div>

              <div className="mt-4">
                <Input
                  label="DiscountValue *"
                  type="number"
                  {...register("discountValue")}
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <Input label="DiscountCode *" {...register("discountCode")} />
                {errors.discountCode && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.discountCode.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={createDiscountMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg mt-4"
              >
                {createDiscountMutation.isPending ? "Creating..." : "Create"}
              </button>

              {createDiscountMutation.isError && (
                <p className="text-red-500 text-xs mt-1">
                  {createDiscountMutation.error.message}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

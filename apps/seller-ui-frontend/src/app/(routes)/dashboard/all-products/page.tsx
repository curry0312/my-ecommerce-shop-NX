"use client";

import React, { useMemo, useState } from "react";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import Link from "next/link";
import DeleteIcon from "@mui/icons-material/Delete";
import { useRouter } from "next/navigation";
import { getProducts } from "apps/seller-ui-frontend/src/axios/getProducts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { products as Products } from "@prisma/client";
import { deleteProduct } from "apps/seller-ui-frontend/src/axios/deleteProduct";

export default function page() {
  const [showModal, setShowModal] = useState(false);
  const [selectedProductData, setSelectedProductData] =
    useState<Products | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState("");

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["get-all-products"],
    queryFn: getProducts,
    staleTime: 5 * 60 * 1000, //cache for 5 minutes
    retry: 1,
  });
  console.log("Products =", products);

  const productsData = useMemo(() => {
    if (products) {
      return products.data;
    }
    return [];
  }, [products]);

  const router = useRouter();

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteProduct({ productId: id }),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["get-all-products"] });
    },
  });

  const handleOpenModal = (id: string) => {
    setShowModal(true);
    setSelectedProductData(
      productsData.find((product) => product.id === id) ?? null
    );
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    console.log(id);
    setShowDeleteModal(true);
    setDeleteProductId(id);
  };

  const handleDelete = (id: string) => {
    setShowDeleteModal(false);
    deleteProductMutation.mutate(id);
  };

  return (
    <div className="w-full min-h-screen p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl text-white font-semibold">Discount Codes</h2>
        <button
          onClick={() => router.push("/dashboard/create-product")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <AddCircleOutlineIcon />
          Create Products
        </button>
      </div>

      <div className="flex items-center text-white">
        <Link href={"/dashboard"} className="text-[#80Deea] cursor-pointer">
          Dashboard
        </Link>
        <KeyboardArrowRightIcon />
        <span>All Products</span>
      </div>

      <div className="mt-8 bg-gray-900 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your All Products
        </h3>

        {isLoading ? (
          <p className="text-gray-400 text-center">Loading...</p>
        ) : (
          <table className="w-full text-white">
            <thead>
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Title</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Category</th>
                <th className="p-3 text-left">Stock</th>
                <th className="p-3 text-left">Rating</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsData?.map((productsData, index) => (
                <tr
                  key={index}
                  onClick={() => handleOpenModal(productsData.id)}
                  className="border-b border-gray-800 hover:bg-gray-800 transition cursor-pointer"
                >
                  <td className="p-3">{productsData.title}</td>
                  <td className="p-3">{productsData.title}</td>
                  <td className="p-3">{productsData.price}</td>
                  <td className="p-3">{productsData.category}</td>
                  <td className="p-3">{productsData.stock}</td>
                  <td className="p-3">{productsData.ratings}</td>
                  <td className="p-3 space-x-2">
                    <button
                      onClick={(e) => handleDeleteClick(e, productsData.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <DeleteIcon />
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && productsData?.length === 0 && (
          <span className="text-gray-400 text-center w-full pt-4 block">
            No Discount Codes Available!
          </span>
        )}
      </div>

      {showModal && selectedProductData && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-semibold text-white">
                Product Details
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
            <div className="mt-4 text-white overflow-y-auto">
              <p className="font-semibold">Product Description:</p>
              <p className="text-xs">{selectedProductData.description}</p>
              <div className="flex flex-col gap-2 mt-4">
                {(
                  selectedProductData.custom_specifications as Array<
                    Record<string, string>
                  >
                ).map((specification, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <p className="font-semibold">{specification.name}:</p>
                    <p>{specification.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg">
            <div className="flex justify-between items-center border-b border-gray-700 pb-3">
              <h3 className="text-lg font-semibold text-white">
                Delete Product
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

            <div className="mt-4">
              <p className="text-white">
                Are you sure you want to delete this product?
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg mt-4">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteProductId)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-4"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

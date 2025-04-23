"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const FormSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required").max(6),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export default function page() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(FormSchema),
  });

  const loginMutation = useMutation({
    mutationFn: async (data: FormSchemaType) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/login-seller`,
        data,
        {
          withCredentials: true,
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data);
      setServerError(null);
      router.push("/");
    },
    onError: (error: AxiosError) => {
      console.log(error);
      setServerError(
        (error.response?.data as { message?: string })?.message ||
          "Something went wrong"
      );
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    console.log(data);
    loginMutation.mutate(data);
  };
  return (
    <div className="w-full py-10 min-h-screen bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-black text-center">
        Login
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#000099]">
        Home . Login
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] flex flex-col items-center p-8 bg-white shadow rounded-lg">
          <h3 className="text-2xl font-semibold text-center mb-2">
            Login to Eshop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#000099]">
              Sign up
            </Link>
          </p>

          <div className="w-full flex items-center space-x-1 my-5 text-gray-500 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span>or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <label className="mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="example@abc.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email format",
                },
              })}
              className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
            <label className="mb-1" htmlFor="email">
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="email"
                placeholder="example12345"
                {...register("password")}
                className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-400"
              >
                {passwordVisible ? (
                  <RemoveRedEyeOutlinedIcon className="w-5 h-5" />
                ) : (
                  <VisibilityOffOutlinedIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}

            <div className="flex justify-between items-center my-4">
              <label htmlFor="rememberMe">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="mr-2"
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-[#000099] text-sm">
                Forgot Password
              </Link>
            </div>
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-md"
            >
              {loginMutation.isPending ? "Loginning..." : "Login"}
            </button>

            {serverError && (
              <p className="text-red-500 text-sm">{serverError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
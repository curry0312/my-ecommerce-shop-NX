"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import googleImage from "../../../assets/images/google.png";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";

const FormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required").max(6),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export default function page() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState<boolean>(true);
  const [timer, setTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormSchemaType | null>(null);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(FormSchema),
  });

  const handleOtpChange = (index: number, value: string) => {
    if(!/^[0-9]*$/.test(value)) return
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < inputRefs.current.length - 1)
      inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const startResendTimer = () => {
    setCanResend(false);
    setTimer(60);
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const signupMutation = useMutation({
    mutationFn: async (data: FormSchemaType) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-registration`,
        data
      );
      return res.data;
    },
    onSuccess: (_, formData) => {
      setUserData(formData);
      setShowOtp(true);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-user`,
        {
          ...userData,
          otp: otp.join(""),
        }
      );
      return res.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const onSubmit = async (data: FormSchemaType) => {
    console.log(data);
    signupMutation.mutate(data);
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-black text-center">
        Signup
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#000099]">
        Home . Signup
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] flex flex-col items-center p-8 bg-white shadow rounded-lg">
          <h3 className="text-2xl font-semibold text-center mb-2">
            Signup to Eshop
          </h3>
          <p className="text-center text-gray-500 mb-4">
            Already have an account?{" "}
            <Link href="/login" className="text-[#000099]">
              Login
            </Link>
          </p>

          <button className="w-[50%] flex items-center justify-center gap-2 mb-4 rounded-lg border border-gray-300 py-2">
            <Image src={googleImage} width={30} height={30} alt={""} />
            <p>Login with Google</p>
          </button>

          <div className="w-full flex items-center space-x-1 my-5 text-gray-500 text-sm">
            <div className="flex-1 border-t border-gray-300" />
            <span>or Sign in with Email</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {showOtp ? (
            <div className="w-full flex flex-col items-center">
              <h3 className="text-xl font-semibold text-enter mb-4">
                Enter OTP
              </h3>
              <div className="flex items-center gap-6">
                {otp.map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={otp[index]}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    ref={(element) => {
                      if (element) inputRefs.current[index] = element;
                    }}
                    className="w-12 h-12 border border-gray-300 rounded-md text-center text-2xl font-semibold outline-none"
                  />
                ))}
              </div>
              <button
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
                className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-400"
              >
                {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
              </button>
              <p className="text-center text-sm mt-4">
                {canResend ? (
                  <>
                    Didn't receive OTP?{" "}
                    <button
                      className="text-[#000099] cursor-pointer"
                      onClick={() => signupMutation.mutate(userData!)}
                    >
                      Resend
                    </button>
                  </>
                ) : (
                  `Resend in ${timer} seconds`
                )}
              </p>
              {verifyOtpMutation.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="text-red-500 text-sm mt-2">
                    {verifyOtpMutation.error.response?.data.message ||
                      verifyOtpMutation.error.message}
                  </p>
                )}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <label className="mb-1" htmlFor="Name">
                Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Example"
                {...register("name")}
                className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
              <label className="mb-1" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="example@abc.com"
                {...register("email")}
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
                  id="password"
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
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}

              <button
                type="submit"
                disabled={signupMutation.isPending}
                className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-md mt-4"
              >
                {signupMutation.isPending ? "Processing..." : "Signup"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

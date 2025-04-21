"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";

const FormSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  password: z.string().min(1, "Password is required").max(6).optional(),
});

type FormSchemaType = z.infer<typeof FormSchema>;

export default function page() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);

  const router = useRouter();

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(FormSchema),
  });

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

  const requestOtpMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/forgot-password-user`,
        { email }
      );
      return res.data;
    },
    onSuccess: (_, { email }) => {
      setServerError(null);
      setUserEmail(email);
      setStep("otp");
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const axiosError = error as AxiosError;
      setServerError(
        (axiosError.response?.data as { message?: string }).message ||
          "Invalid email"
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ email, otp }: { email: string; otp: string }) => {
      if (!email && otp) return;
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-forgot-password-user`,
        { email, otp }
      );
      return res.data;
    },
    onSuccess: () => {
      setServerError(null);
      setStep("reset");
    },
    onError: (error: AxiosError) => {
      const axiosError = error as AxiosError;
      setServerError(
        (axiosError.response?.data as { message?: string }).message ||
          "Invalid OTP"
      );
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      if (!email && !password) return;
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reset-password-user`,
        { email, newPassword: password }
      );
      return res.data;
    },
    onSuccess: () => {
      setServerError(null);
      setStep("email");
      toast.success("Password reset successfully");
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      const axiosError = error as AxiosError;
      setServerError(
        (axiosError.response?.data as { message?: string }).message ||
          "Failed to reset password, try again"
      );
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const copyOtp = [...otp];
    copyOtp[index] = value;
    setOtp(copyOtp);
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

  const resendOtp = () => {
    if (!userEmail) return;
    requestOtpMutation.mutate({ email: userEmail });
    startResendTimer();
  };

  const onSubmitEmail = async (data: FormSchemaType) => {
    console.log(data);
    if (!data.email) return console.log("Email is required");
    requestOtpMutation.mutate({ email: data.email });
  };

  const onSubmitOtp = async ({
    email,
    otp,
  }: {
    email: string;
    otp: string;
  }) => {
    if (!userEmail) return;
    verifyOtpMutation.mutate({ email: email, otp });
  };

  const onSubmitReset = async (data: FormSchemaType) => {
    if (!data.email) return;
    if (!data.password) return;

    resetPasswordMutation.mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="w-full py-10 min-h-[85vh] bg-[#f1f1f1]">
      <h1 className="text-4xl font-poppins font-semibold text-black text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg font-medium py-3 text-[#000099]">
        Home . Forgot-Password
      </p>

      <div className="w-full flex justify-center">
        <div className="md:w-[480px] flex flex-col items-center p-8 bg-white shadow rounded-lg">
          {step === "email" && (
            <>
              <h3 className="text-2xl font-semibold text-center mb-2">
                Login to Eshop
              </h3>
              <p className="text-center text-gray-500 mb-4">
                Go back to ?
                <Link href="/login" className="text-[#000099]">
                  Login
                </Link>
              </p>

              <form onSubmit={handleSubmit(onSubmitEmail)} className="w-full">
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

                <button
                  type="submit"
                  disabled={requestOtpMutation.isPending}
                  className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-md mt-4"
                >
                  {requestOtpMutation.isPending ? "Sending..." : "Request OTP"}
                </button>

                {serverError && (
                  <p className="text-red-500 text-sm">{serverError}</p>
                )}
              </form>
            </>
          )}
          {step === "otp" && (
            <>
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
                  onClick={() =>
                    verifyOtpMutation.mutate({
                      email: userEmail!,
                      otp: otp.join(""),
                    })
                  }
                  className="w-full mt-4 text-lg cursor-pointer bg-blue-500 text-white py-2 rounded-md hover:bg-blue-400"
                >
                  {verifyOtpMutation.isPending ? "Verifying..." : "Verify"}
                </button>
                <p className="text-center text-sm mt-4">
                  {canResend ? (
                    <>
                      Didn't receive OTP?{" "}
                      <button
                        type="button"
                        className="text-[#000099] cursor-pointer"
                        onClick={resendOtp}
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
                      {(
                        verifyOtpMutation.error.response?.data as {
                          message?: string;
                        }
                      ).message || verifyOtpMutation.error.message}
                    </p>
                  )}
              </div>
            </>
          )}
          {step === "reset" && (
            <>
              <h3 className="text-xl font-semibold text-center mb-4">
                Reset Password
              </h3>
              <form onSubmit={handleSubmit(onSubmitReset)} className="w-full">
                <label className="block text-gray-700 mb-1" htmlFor="password">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter new password"
                  {...register("password")}
                  className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                />
                {errors.password && (
                  <p className="w-full text-red-500 text-sm">
                    {errors.password.message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                  className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-md mt-4"
                >
                  {resetPasswordMutation.isPending ? "Resetting..." : "Reset"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

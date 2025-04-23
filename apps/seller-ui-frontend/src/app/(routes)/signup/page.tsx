"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { COUNTRIES } from "apps/seller-ui-frontend/src/utils/countries";
import Link from "next/link";
import CreateShop from "apps/seller-ui-frontend/src/components/modules/CreateShop";

const SellerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required").max(6),
  phoneNumber: z.string().min(10, "Phone number is required").max(10),
  country: z.string().min(1, "Country is required"),
});

export type SellerFormSchemaType = z.infer<typeof SellerFormSchema>;

export default function page() {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [canResend, setCanResend] = useState<boolean>(true);
  const [timer, setTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [sellerData, setSellerData] = useState<SellerFormSchemaType | null>(
    null
  );
  const [sellerId, setSellerId] = useState<string | null>(null);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SellerFormSchema),
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
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
    mutationFn: async (data: SellerFormSchemaType) => {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/seller-registration`,
        data
      );
      return res.data;
    },
    onSuccess: (_, formData) => {
      setSellerData(formData);
      setShowOtp(true);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!sellerData) return;
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/verify-seller`,
        {
          ...sellerData,
          otp: otp.join(""),
        }
      );
      return res.data;
    },
    onSuccess: (data) => {
      setSellerId(data.data.id);
      setActiveStep(2);
    },
  });

  const onSubmit = async (data: SellerFormSchemaType) => {
    console.log(data);
    signupMutation.mutate(data);
  };

//   const handleConnectStripe = async () => {
//     try {
//       console.log(sellerId);
//       if (!sellerId) return;
//       const res = await axios.post(
//         `${process.env.NEXT_PUBLIC_API_URL}/api/connect-stripe`,
//         {
//           sellerId,
//         }
//       );
//       window.location.href = res.data.data.url;
//     } catch (error) {
//       console.log("Stripe Connection error", error);
//     }
//   };

  return (
    <div className="w-full py-10 min-h-screen bg-[#f1f1f1]">
      {/*Stepper for signup*/}
      <div className="flex items-center md:w-[50%] mx-auto mb-8">
        {[1, 2].map((step, index) => (
          <div
            key={step}
            className={`${step !== 2 ? "flex-1" : ""} flex items-center`}
          >
            <div className="relative flex items-center">
              <div
                className={`w-10 h-10 aspect-square rounded-full flex items-center justify-center font-bold ${
                  step <= activeStep
                    ? "bg-[#3489FF] text-white"
                    : "bg-[#ffffff] text-gray-400"
                }`}
              >
                {step}
              </div>
              <span
                className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm truncate ${
                  step <= activeStep ? "text-[#3489FF]" : "text-gray-400"
                }`}
              >
                {step === 1
                  ? "Create account"
                  : step === 2
                  ? "Set up shop"
                  : "Connect bank"}
              </span>
            </div>
            {step !== 2 && (
              <div
                className={`w-full h-1 ${
                  step < activeStep ? "bg-[#3489FF]" : "bg-[#d5c9c9]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="md:w-[480px] m-auto flex flex-col items-center p-8 bg-white shadow rounded-lg">
        {activeStep === 1 && (
          <>
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
                        onClick={() => signupMutation.mutate(sellerData!)}
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
                <h3 className="text-2xl font-semibold text-center mb-4">
                  Create your account
                </h3>
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
                  PhoneNumber
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  placeholder="0912345678"
                  {...register("phoneNumber")}
                  className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">
                    {errors.phoneNumber.message}
                  </p>
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

                <label className="mb-1" htmlFor="email">
                  Country
                </label>
                <select
                  {...register("country")}
                  className="w-full p-2 border border-gray-300 outline-0 rounded-md mb-1"
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((country) => (
                    <option key={country.name} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-500 text-sm">
                    {errors.country.message}
                  </p>
                )}

                <p className="text-center text-gray-500 my-4">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#000099]">
                    Login
                  </Link>
                </p>

                <button
                  type="submit"
                  disabled={signupMutation.isPending}
                  className="w-full text-lg cursor-pointer bg-black text-white py-2 rounded-md mt-4"
                >
                  {signupMutation.isPending ? "Processing..." : "Signup"}
                </button>
              </form>
            )}
          </>
        )}
        {activeStep === 2 && sellerId && (
          <CreateShop sellerId={sellerId} setActiveStep={setActiveStep} />
        )}
        {/* {activeStep === 3 && (
          <div>
            <h3 className="text-2xl font-semibold text-center mb-4">
              Setup Your bank
            </h3>
            <br />
            <button
              onClick={handleConnectStripe}
              className="w-full flex items-center justify-center gap-1 text-lg cursor-pointer bg-black text-white py-2 rounded-md mt-4 hover:bg-gray-600"
            >
              Connect Stripe <StripeLogo />
            </button>
          </div>
        )} */}
      </div>
    </div>
  );
}

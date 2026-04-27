"use client";
import OTPInput from "@/components/OTPInput";
import { useState } from "react";
import toast from "react-hot-toast";
import z from "zod";
import { useRouter } from "next/navigation";
import { useResendOtp, useVerifyOtp } from "@/app/otp/hooks/verify-otp";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

const otpschema = z.array(z.string().length(1)).length(6);

const OTPVerification = ({ id }: { id: string }) => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const router = useRouter();

  const handleResendOtp = async () => {
    setIsResending(true);
    console.log(id);
    await resendOtp.mutate(
      { jwt: id },
      {
        onSuccess: (data) => {
          router.push(`/otp/${data.jwt}`);
        },
        onSettled: () => {
          setIsResending(false);
        },
      }
    );
  };

  const handleOTPSubmit = async () => {
    setIsSubmitting(true);
    console.log("handleOTPSubmit");
    const parsedOtp = otpschema.safeParse(otp);

    if (parsedOtp.success) {
      console.log(parsedOtp.data);
      const otpString = parsedOtp.data.join("");

      const data = { otp: otpString, jwt: id };

      verifyOtp.mutate(data, {
        onSuccess: async (data) => {
          console.log(data);
          toast.success("OTP verified successfully");
          if (data?.jwt) {
            router.push(`/new-password/${data.jwt}`);
          } else {
            
              router.push("/signIn");
            }
        },
        onError: (error) => {
          console.log(error);
          toast.error("Invalid OTP");
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      });
    } else {
      toast.error("Invalid OTP");
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row">
        {/* Left Section - Image */}
        <div className="relative w-full md:w-1/2 bg-[#f8f3e9] hidden md:block">
          <div className="absolute top-6 left-6 z-10">
            <Image
              src="https://res.cloudinary.com/dklqhgo8r/image/upload/v1741713365/omez9tvbpnwgmsnj3q3w.png"
              alt="RAAS The Creation Logo"
              width={120}
              height={50}
              className="h-auto"
            />
          </div>
          <div className="h-full">
            <Image
              src="/lot_0036__PUN0667.png"
              alt="Model in orange traditional outfit"
              fill
              className="object-cover "
              priority
            />
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white">
          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-8">
              {/* Logo for mobile view */}
              <div className="md:hidden">
                <Image
                  src="https://res.cloudinary.com/dklqhgo8r/image/upload/v1741713365/omez9tvbpnwgmsnj3q3w.png"
                  alt="RAAS The Creation Logo"
                  width={100}
                  height={40}
                  className="h-auto"
                />
              </div>
              <Link
                href="/"
                className="ml-auto bg-[#a08452] hover:bg-[#8c703d] text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <span>BACK</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-medium mb-2">OTP Confirmation</h1>
              <p className="text-gray-500 flex items-center gap-1">
                OTP is sent to your <MessageCircle className="text-[#a08452]" />{" "}
                WhatsApp mobile number
              </p>
            </div>
            <OTPInput otp={otp} onChangeOtp={setOtp} />
            <p className="relative text-end mt-3 mb-6 text-sm text-[#a08452]">
              <button 
                onClick={handleResendOtp} 
                disabled={isResending}
                className="disabled:opacity-50"
              >
                {isResending ? 'Resending...' : 'Resend SMS'}
              </button>
            </p>
            <button
              className="w-full p-3 text-white text-lg rounded-xl bg-[#a08452] shadow-lg disabled:opacity-50"
              onClick={handleOTPSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Verifying...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OTPVerification;

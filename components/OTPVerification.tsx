"use client";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/axiosClient";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle } from "lucide-react";
import OTPInput from "./OTPInput";
import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

const OTPVerification = ({ mobileNumber }: { mobileNumber: string }) => {
  const [otp, setOtp] = useState<string[]>(Array(7).fill(""));
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  const startResendTimer = () => {
    setIsResendDisabled(true);
    setTimer(900);
  };

  useEffect(() => {
    const sendOTP = async () => {
      try {
        const res = await apiClient.get(
          "/api/customers/otp?mobile_no=" + mobileNumber
        );
        if (res.status === 202) {
          toast.error(res.data.message);
          return;
        }
        toast.success("OTP sent to your WhatsApp");
        startResendTimer();
      } catch (error) {
        console.error("Error sending OTP:", error);
        toast.error("Failed to send OTP");
      }
    };
    sendOTP();
  }, [mobileNumber]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isResendDisabled && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            setIsResendDisabled(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResendDisabled, timer]);

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some((digit) => digit === "")) {
      toast.error("Please fill all OTP fields");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await apiClient.post("/api/customers/verify-otp", {
        mobileNumber,
        otp: otp.join(""),
        type: "verify",
      });
      if (res.status !== 200) {
        toast.error(res.data.message);
      }
      toast.success("OTP verified successfully!");
      router.push("/signin");
      setIsResendDisabled(false);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("Failed to verify OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };
  const handleResendOTP = async () => {
    try {
      const res = await apiClient.get(
        "/api/customers/otp?mobile_no=" + mobileNumber
      );
      toast.success("OTP resent to your WhatsApp");
      if (res.status === 202) {
        toast.error(res.data.message);
        return;
      }
      startResendTimer();
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error("Failed to resend OTP");
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
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
            <form className="bg-transparent" onSubmit={handleOTPSubmit}>
              <OTPInput otp={otp} onChangeOtp={setOtp} />
              <p className="text-end mt-3 mb-6 text-sm text-[#a08452]">
                {isResendDisabled ? (
                  <span>Resend available in {formatTime(timer)}</span>
                ) : (
                  <button type="button" onClick={handleResendOTP}>
                    Resend SMS
                  </button>
                )}
              </p>
              <button
                className="w-full p-3 text-white  text-lg rounded-xl bg-[#a08452]    shadow-lg disabled:opacity-50"
                disabled={isVerifying}
              >
                {isVerifying ? "Verifying..." : "Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default OTPVerification;

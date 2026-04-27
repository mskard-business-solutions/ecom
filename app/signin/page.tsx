"use client";
import { useEffect, useState } from "react";
import type React from "react";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { LoginSchema } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { loginFunction } from "./actions/sign-in-action";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type FormValues = {
  mobileNumber: string;
  password: string;
}

export default function LoginPage() {
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data:session, status } = useSession();


  if (session?.user) {
    router.push("/account/orders");
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      mobileNumber: "",
      password: "",
    },
  });

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-lg font-semibold text-gray-700">Checking authentication...</div>
      </div>
    );
  }

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      const data: any = await loginFunction(values);

      if (data === "Login successful") {
        toast.success("Login successful");
        setTimeout(() => {
          router.refresh();
        }, 500);
        router.push("/");
      } else {
        toast.error(data);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
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
            src="lot_0005__PUN0762.png"
            alt="Model in purple traditional outfit"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-12 bg-white shadow-lg">
        <div className="w-full max-w-md space-y-8">
          <div className="flex justify-between items-center">
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
              className="ml-auto bg-[#a08452] hover:bg-[#8c703d] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <span>BACK</span>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">WELCOME 👋</h1>
            <p className="text-gray-600">Please login here</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Mobile Number */}
              <FormField
                control={form.control}
                name="mobileNumber"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Mobile Number
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        country={"in"}
                        value={field.value}
                        onChange={(phone) => onChange(phone)}
                        disabled={isLoading}
                        inputClass="!w-full px-10 !py-3 !border !border-gray-300 !rounded-lg !focus:outline-none !focus:ring-2 !focus:ring-[#a08452] !focus:border-transparent"
                        buttonClass="!bg-[#a08452] hover:!bg-[#8c703d] !rounded-lg !border-0 !transition-colors !duration-200"
                        dropdownClass="!bg-white !text-gray-900 !shadow-lg !rounded-lg !border !border-gray-100"                        searchClass="!bg-white !text-gray-900"
                        inputProps={{
                          required: true,
                          placeholder: "Enter your mobile number",
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        disabled={isLoading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a08452] focus:border-transparent"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="text-[#a08452] focus:ring-[#a08452]"
                  />
                  <label htmlFor="remember-me" className="text-sm text-gray-600 cursor-pointer">
                    Remember Me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[#a08452] hover:text-[#8c703d] transition-colors duration-200"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#a08452] hover:bg-[#8c703d] text-white py-3 rounded-lg font-medium transition-colors duration-200"
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-[#a08452] hover:text-[#8c703d] font-medium transition-colors duration-200">
                    Register
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/app/new-password/hooks/hooks";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Password validation schema
const NewPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const NewPassword = ({ id }: { id: string }) => {
  const { mutate, isPending: isLoading } = useResetPassword();

  const router = useRouter();

  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof NewPasswordSchema>) {
    try {
      // Replace with your actual password update logic
      await mutate(
        { password: values.password, token: id },
        {
          onSuccess: (data) => {
            console.log(data);
          },
          onError: (error) => {
            console.error(error);
          },
        }
      );

      // Redirect to login or confirmation page
      router.push("/signin");
    } catch (error) {
      console.error(error);
    } finally {
    }
  }

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
              <h1 className="text-3xl font-medium mb-2">
                Enter a New Password
              </h1>
              <p className="text-gray-500 flex items-center gap-1">
                Password Must Contain At Least 8 Characters
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="bg-transparent space-y-4"
              >
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-xl border-2 border-[#a08452] ">
                          <Input
                            type="password"
                            placeholder="New Password"
                            className="w-full p-4 sm:p-5 text-black bg-transparent border-0 rounded-xl outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm ml-2" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="rounded-xl border-2 border-[#a08452]">
                          <Input
                            type="password"
                            placeholder="Confirm Password"
                            className="w-full p-4 sm:p-5 text-black bg-transparent border-0 rounded-xl outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400 text-sm ml-2" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full p-3 text-white text-lg rounded-xl bg-[#a08452] shadow-[0_4px_20px_rgba(255,255,255,0.6)] "
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Continue"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewPassword;

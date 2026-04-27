  /* eslint-disable @typescript-eslint/no-explicit-any */
  "use server";
  import { signOut } from "@/auth";

  import { SignUpSchema } from "@/types/types";
  import { z } from "zod";
  import { apiClient } from "@/lib/axiosClient";

  export async function handleSignOut() {
    await signOut();
  }

  export async function handleSignup(data: z.infer<typeof SignUpSchema>) {
    try {
      console.log(data);

      // Call backend API to create user instead of direct database access
      const response = await apiClient.post("/api/auth/signup", {
        name: data.name,
        mobileNumber: data.mobileNumber,
        password: data.password,
      });

      const otpResponse = await apiClient.post("/api/customers/otp", { 
        mobile_no: response.data.mobileNumber, 
        type: "verify" 
      });
      console.log(otpResponse.data);
      
      return { jwt: otpResponse.data.jwt };

    } catch (error: any) {
      return { error: error.message || "Something went wrong" };
    }
  }

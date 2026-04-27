"use client";

import { customerApi } from "@/lib/api/customer";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function AccountPage() {
  const router = useRouter();
  const { data: user , isLoading} = useQuery({
    queryKey: ["user"],
    queryFn: customerApi.getCustomer,
  });

  if (isLoading) {
    return <h2>Loading...</h2>;
  }
  

  if (!user) {
    return router.push("/signin");
  }

  router.push("/account/orders");
}

"use client";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";

export default function ProductDetail() {
  const params = useParams();
  const slug = params?.slug;

  if(!slug){
    return <div>Product not found</div>;
  }

  if(typeof slug !== "string"){
    return <div>Product not found</div>;
  }


  return <ProductDetails slug={slug} />;
}

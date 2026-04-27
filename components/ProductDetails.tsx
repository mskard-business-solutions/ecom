"use client";
import { useEffect, useState } from "react";
import type React from "react";
import { LoadingProductDetails, LoadingProducts } from "@/components/ui/loader";
import Image from "next/image";
import Link from "next/link";
import {
  Minus,
  Plus,
  Heart,
  Package,
  RefreshCw,
  HeadphonesIcon,
  CreditCard,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/cart-context";
import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/productdetails";
import { Products, Size } from "./admin/products-table";
import { productReviewApi } from "@/lib/api/productreview";
import { wishlistApi } from "@/lib/api/wishlist";
import { customerApi } from "@/lib/api/customer";
import toast from "react-hot-toast";
import { Feature, ProductCard } from "@/app/page";
import { analyticApi } from "@/lib/api/analytic";

export default function ProductDetails({ slug }: { slug: string }) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedSizeId, setSelectedSizeId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("descriptions");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState<Products | null>(null);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [isProductInWishlist, setIsProductInWishlist] = useState(false);
  const queryClient = useQueryClient();
  const [avgRating, setAvgRating] = useState(5);
  const [stockStatus, setStockStatus] = useState<string>("in_stock");
  const [stockCount, setStockCount] = useState<number>(0);
  // State to track the currently selected image
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  // Functions for image slider navigation
  const goToNextImage = () => {
    if (product && product.assets) {
      setSelectedImageIndex((prev) => 
        prev === product.assets.length - 1 ? 0 : prev + 1
      );
    }
  };

  const goToPrevImage = () => {
    if (product && product.assets) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? product.assets.length - 1 : prev - 1
      );
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    // Added check to prevent quantity exceeding available stock
    if (stockCount > 0 && quantity < stockCount) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`Sorry, only ${stockCount} items available in stock.`);
    }
  };

  const handleAddToCart = () => {
    if (!product) {
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discountPrice ?? product.price,
      originalPrice: product.price,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      image: product?.assets[selectedImageIndex].asset_url,
      productVariantId: selectedSizeId,
    });
    toast.success("Product added to cart");
  };

  // Set sizes based on selected color
  const handleColorSelect = (colorCode: string) => {
    setSelectedColor(colorCode);

    // Find the selected color in the product colors
    if (product && product.colors) {
      const color = product.colors.find((c) => c.color === colorCode);
      if (color && color.sizes) {
        setAvailableSizes(color.sizes);
        // Reset selected size or select first available size
        if (color.sizes.length > 0) {
          const firstAvailableSize =
            color.sizes.find((s) => s.stock > 0) || color.sizes[0];
          setSelectedSize(firstAvailableSize.size);
          setSelectedSizeId(firstAvailableSize.id);
        } else {
          setSelectedSize("");
        }
      }
    }
  };

  // Fetching Product Details
  const { data, isLoading, error } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        const res = await productApi.getBySlug(slug);
        return res;
      } catch (err) {
        throw new Error("Failed to fetch product");
      }
    },
  });

  // Fetching Product Reviews
  const { data: customerReviews, isLoading: loadingReview } = useQuery({
    queryKey: ["productReview", data?.id],
    queryFn: async () => {
      try {
        const res = await productReviewApi.getAll(data?.id as string);
        return res;
      } catch (err) {
        throw new Error("Failed to fetch product reviews");
      }
    },
    enabled: !!data?.id,
  });

  useEffect(() => {
    if (customerReviews) {
      setAvgRating(
        Number(
          (
            customerReviews.reduce((acc, review) => acc + review.rating, 0) /
            customerReviews.length
          ).toFixed(1)
        )
      );
    }
  }, [customerReviews]);

  const relatedProducts = [
    {
      id: "1",
      name: "Raas Scarlet Red Ikkat Print Suit Set",
      price: 3490.0,
      image: "/lot_0005__PUN0762.png?height=300&width=250",
    },
    {
      id: "2",
      name: "Raas Scarlet Red Ikkat Print Suit Set",
      price: 3490.0,
      image: "/lot_0009__PUN0747.png?height=300&width=250",
    },
    {
      id: "3",
      name: "Raas Scarlet Red Ikkat Print Suit Set",
      price: 3490.0,
      image: "/image.png?height=300&width=250",
    },
    {
      id: "4",
      name: "Raas Scarlet Red Ikkat Print Suit Set",
      price: 3490.0,
      image: "/image 100.png?height=300&width=250",
    },
  ];

  const handleReviewSubmit = async (e: any) => {
    e.preventDefault();
    // Validate form
    if (reviewRating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    try {
      setIsSubmitting(true);
      const reviewData = {
        title: reviewTitle,
        rating: reviewRating,
        description: reviewText,
      };
      await productReviewApi.create(data?.id as string, reviewData);
      queryClient.invalidateQueries({ queryKey: ["productReview", data?.id] });
      toast.success("Review submitted successfully!");
      setReviewRating(0);
      setReviewTitle("");
      setReviewText("");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (data) {
      setProduct(data);
      // Set default image index to 0
      setSelectedImageIndex(0);
      // Set default color and sizes when product loads
      if (data.colors && data.colors.length > 0) {
        const defaultColor = data.colors[0].color;
        setSelectedColor(defaultColor);
        // Set available sizes based on the default color
        if (data.colors[0].sizes) {
          setAvailableSizes(data.colors[0].sizes);
          // Select first available size
          const firstAvailableSize =
            data.colors[0].sizes.find((s) => s.stock > 0) ||
            data.colors[0].sizes[0];
          setSelectedSize(firstAvailableSize.size);
          setSelectedSizeId(firstAvailableSize.id);
        }
      }
    }
  }, [data]);

  useEffect(() => {
    if (selectedSize && selectedSizeId && availableSizes) {
      const selectedSizeData = availableSizes.find(
        (s) => s.size === selectedSize
      );
      if (selectedSizeData) {
        const stockCount = selectedSizeData.stock;

        if (stockCount === 0) {
          setStockStatus("out_of_stock");
        } else if (stockCount <= 3) {
          setStockStatus("low_stock");
          setStockCount(stockCount);
        } else if (stockCount <= 10) {
          setStockStatus("limited_stock");
          setStockCount(stockCount);
        } else {
          setStockStatus("in_stock");
          // Set stock count even for "in_stock" status for quantity validation
          setStockCount(stockCount);
        }

        // Reset quantity if it exceeds new stock count
        if (quantity > stockCount) {
          setQuantity(stockCount > 0 ? 1 : 0);
        }
      }
    }
  }, [selectedSize, selectedSizeId, availableSizes]);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: customerApi.getCustomer,
  });

  const { data: wishlistProducts } = useQuery({
    queryKey: ["wishlistProducts"],
    queryFn: wishlistApi.getProductList,
    enabled: !!user?.id,
  });

  // Add these mutations
  const addToWishlist = useMutation({
    mutationFn: () => wishlistApi.addtoWishlist(product?.id || ""),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistProducts"] });
      toast.success(`${product?.name} added to wishlist`);
    },
    onError: () => {
      toast.error("Failed to add product to wishlist");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: () => wishlistApi.removeFromWishlist(product?.id || ""),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistProducts"] });
      toast.success(`${product?.name} removed from wishlist`);
    },
    onError: () => {
      toast.error("Failed to remove product from wishlist");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const { data: newArrivals, isLoading: newArrivalsLoad } = useQuery({
    queryKey: ["newArrivals"],
    queryFn: analyticApi.getNewArrivals,
  });
  console.log("New Arrivals", newArrivals);

  const { data: wishlist } = useQuery({
    queryKey: ["wishlistProducts"],
    queryFn: wishlistApi.getProductList,
    enabled: !!user?.id,
  });

  // Add this effect to check if product is in wishlist
  useEffect(() => {
    if (wishlistProducts && product) {
      setIsProductInWishlist(wishlistProducts.includes(product.id));
    }
  }, [wishlistProducts, product]);

  // Add this handler function
  const handleWishlistToggle = () => {
    if (loading) return;
    if (!user) {
      toast.error("Please log in to add products to your wishlist.");
      return;
    }

    if (isProductInWishlist) {
      removeFromWishlist.mutate();
    } else {
      addToWishlist.mutate();
    }
  };
  // Split by lines that start with asterisk and process each line
  const mainDesc = data?.description.split("\n\nSpecifications\n\n*")[0];
  const specLines = data?.description
    ?.split("\n\nSpecifications\n\n*")[1]
    ?.split(/\n\*/)
    ?.map((line) => line.trim());

  if (error) {
    return <div>Error loading product</div>;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <LoadingProductDetails />
        </div>
        <SiteFooter />
      </main>
    );
  }

  if (!data) {
    return <div>Product not found</div>;
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Product Detail Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Images - Now as a slider */}
          <div className="relative">
            <div className="mb-4 aspect-square relative rounded-md overflow-hidden">
              {product?.assets && product.assets.length > 0 && (
                <Image
                  src={
                    product.assets[selectedImageIndex].asset_url ||
                    "/placeholder.svg"
                  }
                  alt={product.name || "image"}
                  fill
                  className="object-cover object-top w-full h-full"
                />
              )}
              
              {/* Navigation buttons */}
              <div className="absolute inset-0 flex items-center justify-between p-2">
                <button 
                  onClick={goToPrevImage}
                  className="bg-white/70 hover:bg-white text-gray-800 rounded-full p-1 shadow-md transition-all"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={goToNextImage}
                  className="bg-white/70 hover:bg-white text-gray-800 rounded-full p-1 shadow-md transition-all"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              
              {/* Image counter indicator */}
              {product?.assets && product.assets.length > 0 && (
                <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded-md">
                  {selectedImageIndex + 1} / {product.assets.length}
                </div>
              )}
            </div>
            
            {/* Slider pagination dots */}
            {product?.assets && product.assets.length > 1 && (
              <div className="flex justify-center mt-4 space-x-2">
                {product.assets.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      selectedImageIndex === index ? "bg-[#a08452] w-4" : "bg-gray-300"
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-2xl font-medium mb-2">{product?.name}</h1>
            <h1 className="font-medium mb-2">{product?.sku}</h1>
            {/* <p className="text-gray-600 mb-4">
              {product?.description}
            </p> */}

            {/* Rating */}
            {customerReviews && customerReviews?.length > 0 ? (
              <div className="flex items-center mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const difference = avgRating - star + 1;
                    return (
                      <div key={star} className="relative">
                        <svg
                          className="w-8 aspect-square text-gray-300"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <div
                          className="absolute top-0 left-0 overflow-hidden"
                          style={{
                            width: `${
                              Math.max(0, Math.min(1, difference)) * 100
                            }%`,
                          }}
                        >
                          <svg
                            className="w-8 aspect-square text-yellow-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {avgRating.toFixed(1)} ({customerReviews.length} Reviews)
                </span>
              </div>
            ) : (
              <div className="flex items-center mb-4">
                <div className="flex">No customer reviews yet</div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center mb-6">
              <span className="text-xl font-medium">
                ₹{product?.discountPrice?.toFixed(2)}
              </span>
              <span className="ml-2 text-gray-500 line-through">
                ₹{product?.price.toFixed(2)}
              </span>
            </div>
            {/* Description */}
            <p className="text-gray-700 mb-6">{mainDesc}</p>
            {/* Stock Status */}
            <div className="mb-6">
              {stockStatus === "in_stock" && (
                <span className="inline-block px-4 py-1.5 border rounded-md border-green-500 text-green-700 text-sm font-medium">
                  In Stock
                </span>
              )}
              {stockStatus === "limited_stock" && (
                <span className="inline-block px-4 py-1.5 border rounded-md border-orange-500 text-orange-700 text-sm font-medium">
                  Limited Stock ({stockCount} left)
                </span>
              )}
              {stockStatus === "low_stock" && (
                <span className="inline-block px-4 py-1.5 border rounded-md border-red-400 text-red-700 text-sm font-medium">
                  Only {stockCount} left!
                </span>
              )}
              {stockStatus === "out_of_stock" && (
                <span className="inline-block px-4 py-1.5 border rounded-md border-gray-500 text-gray-700 text-sm font-medium">
                  Out of Stock
                </span>
              )}
            </div>
            {/* Color Selection - Added as small square boxes */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Color</h3>
              <div className="flex flex-wrap gap-3">
                {product?.colors?.map((color) => (
                  <button
                    key={color.id}
                    className={`w-8 h-8 rounded-sm border ${
                      selectedColor === color.color
                        ? "ring-2 ring-offset-2 ring-[#a08452]"
                        : "ring-1 ring-gray-300"
                    }`}
                    style={{ backgroundColor: `${color.colorHex}` }}
                    onClick={() => handleColorSelect(color.color)}
                    aria-label={`Select ${color.color} color`}
                    title={color.color}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection - Optimized */}
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((sizeObj) => {
                  const isSelected = selectedSize === sizeObj.size;
                  const isAvailable = sizeObj.stock > 0;

                  return (
                    <button
                      key={sizeObj.size}
                      className={`w-12 h-12 flex items-center justify-center rounded-md border transition-all relative overflow-hidden
                      ${
                        isSelected
                          ? "bg-[#a08452] text-white border-[#a08452]"
                          : isAvailable
                          ? "border-gray-400 text-gray-800 hover:border-[#a08452]"
                          : "border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed"
                      }
                    `}
                      onClick={() => {
                        if (isAvailable) {
                          setSelectedSize(sizeObj.size);
                          setSelectedSizeId(sizeObj.id);
                        }
                      }}
                      disabled={!isAvailable}
                    >
                      {sizeObj.size.slice(5)}

                      {/* Diagonal Line if not available */}
                      {!isAvailable && (
                        <div className="absolute w-[150%] h-full top-0 left-[-25%] flex items-center justify-center pointer-events-none">
                          <div className="w-[100%] h-[2px] bg-gray-400 -rotate-45" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {availableSizes.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  No sizes available for this color
                </p>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center border border-gray-300 rounded-md">
                <button
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={decreaseQuantity}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center">{quantity}</span>
                <button
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={increaseQuantity}
                  disabled={
                    stockStatus === "out_of_stock" || quantity >= stockCount
                  }
                >
                  <Plus
                    className={`h-4 w-4 ${
                      stockStatus === "out_of_stock" || quantity >= stockCount
                        ? "text-gray-300"
                        : ""
                    }`}
                  />
                </button>
              </div>

              <Button
                className="flex-1 bg-[#a08452] hover:bg-[#8c703d] text-white transition-colors h-auto py-2"
                onClick={handleAddToCart}
                disabled={
                  !selectedSize ||
                  availableSizes.length === 0 ||
                  stockStatus === "out_of_stock"
                }
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 transition-colors w-8 h-8 p-0 flex items-center justify-center"
                onClick={handleWishlistToggle}
                disabled={loading}
              >
                <Heart
                  className={`h-4 w-4 ${
                    isProductInWishlist ? "fill-[#a08452] text-[#a08452]" : ""
                  }`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Product Tabs - Fixed to sync active tab with selection */}
        <div className="mb-16">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="border-b w-full justify-start rounded-none bg-transparent mb-6">
              <TabsTrigger
                value="descriptions"
                className={`pb-2 rounded-none ${
                  activeTab === "descriptions"
                    ? "border-b-2 border-[#a08452] text-[#a08452]"
                    : "text-gray-600"
                }`}
              >
                Descriptions
              </TabsTrigger>
              <TabsTrigger
                value="additional"
                className={`pb-2 rounded-none ${
                  activeTab === "additional"
                    ? "border-b-2 border-[#a08452] text-[#a08452]"
                    : "text-gray-600"
                }`}
              >
                Additional Information
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className={`pb-2 rounded-none ${
                  activeTab === "reviews"
                    ? "border-b-2 border-[#a08452] text-[#a08452]"
                    : "text-gray-600"
                }`}
              >
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="descriptions" className="mt-0">
              <div className="prose max-w-none">
                <p>{mainDesc}</p>
                <p>
                  <strong>Features:</strong>
                </p>
                <ul>
                  {specLines?.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="additional" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Available Colors</h3>
                  <div className="flex flex-wrap gap-2">
                    {product?.colors.map((color) => (
                      <div
                        key={color.id}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className="w-4 h-4 rounded-sm border border-gray-300"
                          style={{ backgroundColor: `${color.color}` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">
                    Care Instructions
                  </h3>
                  <p>Dry clean only</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-0">
              {/* Reviews content - keeping original */}
              <div>
                <h2 className="text-xl font-medium mb-6">Customer Reviews</h2>

                {/* Customer Reviews List */}
                <div className="space-y-8 mb-12">
                  {customerReviews?.map((review) => (
                    <div key={review.id} className="border-b pb-8">
                      <div className="flex items-start">
                        <div className="mr-4">
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              src={review.image || "/placeholder.svg"}
                              alt={review.title}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium">{review.title}</h3>
                          <div className="flex my-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">
                            {review.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Posted on {review.updatedAt?.slice(0, 10)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Review Form */}
                <div>
                  <h2 className="text-xl font-medium mb-6">Add your Review</h2>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm font-medium mb-2">Your Rating</p>
                        <div className="flex space-x-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              className="p-1"
                              onClick={() => setReviewRating(rating)}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  rating <= reviewRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="review-title"
                          className="block text-sm font-medium mb-1"
                        >
                          Title
                        </label>
                        <input
                          id="review-title"
                          type="text"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="Enter Review Title"
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#a08452]"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="review-text"
                          className="block text-sm font-medium mb-1"
                        >
                          Your Review
                        </label>
                        <textarea
                          id="review-text"
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Enter Your Review"
                          rows={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#a08452]"
                          required
                        />
                      </div>
                      <div>
                        <Button
                          type="submit"
                          className="bg-[#a08452] hover:bg-[#8c703d] text-white px-8"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <h2 className="text-2xl font-medium mb-8">New Arrivals</h2>
          {!newArrivalsLoad ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals?.map((product, index) => (
                <ProductCard
                  key={index}
                  product={product}
                  wishlistProducts={wishlist || []}
                />
              ))}
            </div>
          ) : (
            <LoadingProducts length={4} />
          )}
        </section>

        {/* Features */}
        <section className="py-12 border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                    <Feature icon={<Package />} title="Free Shipping" text="" />
                    <Feature
                      icon={<RefreshCw />}
                      title="Quality Assurance"
                      text="100% quality guarantee"
                    />
                    <Feature
                      icon={<HeadphonesIcon />}
                      title="Online Support"
                      text="24 hours a day, 7 days a week"
                    />
                    <Feature
                      icon={<CreditCard />}
                      title="Flexible Payment"
                      text="Pay with multiple credit cards"
                    />
                  </div>
                </div>
              </section>
      </div>

      <SiteFooter />
    </main>
  );
}
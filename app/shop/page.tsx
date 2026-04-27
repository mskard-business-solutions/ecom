"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  Package,
  RefreshCw,
  HeadphonesIcon,
  CreditCard,
  ChevronRight,
  Briefcase,
  Filter,
  X,
  HeartOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/context/cart-context";
import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/lib/api/productdetails";
import { Products } from "@/components/admin/products-table";
import { LoadingProducts, LoadingSidebar } from "@/components/ui/loader";
import { wishlistApi } from "@/lib/api/wishlist";
import toast from "react-hot-toast";
import { customerApi } from "@/lib/api/customer";
import { categoryApi } from "@/lib/api/categories";
import { Category } from "@/types/types";
import { useSearchParams } from "next/navigation";
import { Feature } from "../page";

const sortOptions = [
  { value: "latest", label: "Sort by latest" },
  { value: "price-low-high", label: "Sort by price: low to high" },
  { value: "price-high-low", label: "Sort by price: high to low" },
];
const fixedColors = ["Red", "Green", "Blue", "Pink", "Purple"];
const fixedSizes = [
  "SIZE_36",
  "SIZE_38",
  "SIZE_40",
  "SIZE_42",
  "SIZE_44",
  "SIZE_46",
];

const maxPriceValue = 10000;

export default function ShopPage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("");
  const [priceRange, setPriceRange] = useState<number>(10000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpandedCategories, setIsExpandedCategories] = useState(false);
  const [showAllColors, setShowAllColors] = useState(false);
  const itemsPerPage = 12;
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValues, setFilterValues] = useState({
    priceRange: 10000,
    sortBy: "",
    selectedColors: [] as string[],
    selectedSizes: [] as string[],
    selectedCategories: [] as string[],
  });
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("q")) {
      setSearchQuery(searchParams.get("q") || "");
    }

    if (searchParams.get("c")) {
      setSelectedCategories([searchParams.get("c") || ""]);
      setFilterValues((prev) => ({
        ...prev,
        selectedCategories,
      }));
    }
  }, [searchParams]);

  const [colors, setColors] = useState<
    { id: string; name: string; hex: string }[]
  >([]);

  const { data: ColorsData } = useQuery({
    queryKey: ["colors"],
    queryFn: async () => {
      const res = await productApi.getColors();
      return res;
    },
  });

  useEffect(() => {
    if (ColorsData) {
      setColors(
        ColorsData.map((color) => ({
          name: color.color,
          hex: color.colorHex,
          id: color.id,
        }))
      );
    }
  }, [ColorsData]);

  const { data: productResponse, isLoading } = useQuery({
    queryKey: [
      "filteredProducts",
      searchQuery,
      currentPage,
      selectedCategories,
      filterValues.priceRange,
      filterValues.sortBy,
      filterValues.selectedColors,
      filterValues.selectedSizes,
    ],
    queryFn: () =>
      productApi.getProducts(currentPage, itemsPerPage, searchQuery, {
        status: "PUBLISHED",
        max_price: filterValues.priceRange,
        // sortBy: filterValues.sortBy.includes("price") ? "price" : "createdAt",
        // sortOrder: filterValues.sortBy === "price-high-low" ? "desc" : "asc",
        color: filterValues.selectedColors.join(",") || undefined,
        size: filterValues.selectedSizes.join(",") || undefined,
        category: selectedCategories.join(",") || undefined,
      }),
  });

  const [products, setProducts] = useState<Products[]>([]);

  // FIXED: Only use one useEffect to handle product updates
  useEffect(() => {
    if (!productResponse?.products) return;

    if (currentPage === 1) {
      setProducts(productResponse.products);
    } else {
      setProducts((prev) => [...prev, ...productResponse.products]);
    }

    const totalPages = productResponse?.pagination?.totalPages || 1;
    setHasMore(currentPage < totalPages);
  }, [productResponse, currentPage]);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: customerApi.getCustomer,
  });

  const { data: wishlistProducts } = useQuery({
    queryKey: ["wishlistProducts"],
    queryFn: wishlistApi.getProductList,
    enabled: !!user?.id,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryApi.getAll,
  });

  const lastProductRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) {
        setCurrentPage((prev) => prev + 1);
      }
    });

    if (lastProductRef.current) {
      observerRef.current.observe(lastProductRef.current);
    }
  }, [products, hasMore, isLoading]);

  const handleColorSelect = (color: string) => {
    setSelectedColors((prev) => {
      if (prev.includes(color)) {
        return prev.filter((c) => c !== color);
      } else {
        return [...prev, color];
      }
    });
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSizes((prev) => {
      if (prev.includes(size)) {
        return prev.filter((s) => s !== size);
      } else {
        return [...prev, size];
      }
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortValue = e.target.value;
    setSortBy(newSortValue);

    // Apply sorting to the current products array
    const sortedProducts = [...products];

    switch (newSortValue) {
      case "latest":
        sortedProducts.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "price-low-high":
        sortedProducts.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceA - priceB;
        });
        break;
      case "price-high-low":
        sortedProducts.sort((a, b) => {
          const priceA = a.discountPrice || a.price;
          const priceB = b.discountPrice || b.price;
          return priceB - priceA;
        });
        break;

      default:
        break;
    }

    setProducts(sortedProducts);
    // Reset to first page when sorting changes
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange(maxPriceValue);
    setSelectedCategories([]);
    setSortBy("");
    setFilterValues({
      priceRange: maxPriceValue,
      sortBy: "",
      selectedColors: [],
      selectedSizes: [],
      selectedCategories: [],
    });
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category.id)) {
        return prev.filter((c) => c !== category.id);
      } else {
        return [...prev, category.id];
      }
    });
  };

  const applyFilters = () => {
    setFilterValues({
      priceRange,
      sortBy,
      selectedColors,
      selectedSizes,
      selectedCategories,
    });
    setCurrentPage(1);
    setIsMobileFilterOpen(false);
  };

  if (isLoading && currentPage === 1) {
    return (
      <main className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row gap-8">
          <LoadingSidebar />
          <LoadingProducts length={3} />
        </div>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center text-sm">
          <Link href="/shop" className="text-gray-600 hover:text-[#795d2a]">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
          <span className="text-gray-900">All Products</span>
        </div>
      </div>

      <div className="md:hidden px-6 mb-4">
        <Button
          onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
          className="w-full flex items-center justify-center gap-2 bg-[#795d2a] text-white"
        >
          {isMobileFilterOpen ? (
            <>
              <X className="h-5 w-5" /> Close Filters
            </>
          ) : (
            <>
              <Filter className="h-5 w-5" /> Open Filters
            </>
          )}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          <div
            className={`
          w-full md:w-64 shrink-0 
          ${isMobileFilterOpen ? "block" : "hidden md:block"}
          absolute md:static z-20 bg-white md:bg-transparent 
          left-0 right-0 px-6 md:px-0
        `}
          >
            <Button
              onClick={applyFilters}
              className="w-full mb-4 bg-[#795d2a] text-white"
            >
              Apply Filters
            </Button>
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <div
                className="flex items-center justify-between mb-3 cursor-pointer"
                onClick={() => setIsExpandedCategories(!isExpandedCategories)}
              >
                <h3 className="font-medium">Product Categories</h3>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isExpandedCategories ? "rotate-180" : ""
                  }`}
                />
              </div>
              <div
                className={`space-y-2 overflow-hidden transition-all duration-300 ${
                  isExpandedCategories ? "max-h-[400px]" : "max-h-48"
                } overflow-y-auto scrollbar-thin scrollbar-thumb-[#795d2a] scrollbar-track-gray-100 pr-2`}
              >
                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading categories...</p>
                ) : (
                  <div className="grid grid-cols-1 gap-1">
                    {categories?.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 hover:bg-white p-2 rounded-md transition-colors"
                      >
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.id)}
                          onCheckedChange={() => handleCategorySelect(category)}
                          className="text-[#795d2a] focus:ring-[#795d2a]"
                        />
                        <label
                          htmlFor={category.id}
                          className="text-sm cursor-pointer hover:text-[#795d2a] transition-colors flex-1"
                        >
                          {category.name}
                        </label>
                        <span className="text-xs text-gray-500">
                          ({category.productCount || 0})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {categories && categories.length > 6 && (
                <button
                  onClick={() => setIsExpandedCategories(!isExpandedCategories)}
                  className="text-sm text-[#795d2a] hover:text-[#5d4720] mt-2 w-full text-center"
                >
                  {isExpandedCategories ? "Show Less" : "Show More"}
                </button>
              )}
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Filter By Price</h3>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm mb-2">Price: ₹0 - ₹{priceRange}</p>
                <input
                  type="range"
                  min="0"
                  max={maxPriceValue}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-[#A08452] rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>₹0</span>
                  <span>₹{maxPriceValue}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Size</h3>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="flex flex-wrap gap-2">
                {fixedSizes.map((size, index) => (
                  <div
                    key={index}
                    onClick={() => handleSizeSelect(size)}
                    className={`w-10 h-10 flex items-center justify-center border rounded cursor-pointer ${
                      selectedSizes.includes(size)
                        ? "bg-[#795d2a] text-white border-[#795d2a]"
                        : "border-gray-300 hover:border-[#795d2a]"
                    }`}
                  >
                    {size.split("SIZE_")[1]}
                  </div>
                ))}
              </div>
            </div>

            {/* Color Filter Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Filter By Color</h3>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="space-y-2">
                {!colors ? (
                  <div className="text-sm text-gray-500">Loading colors...</div>
                ) : colors.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No colors available
                  </div>
                ) : (
                  <>
                    {colors
                      .slice(0, showAllColors ? colors.length : 6)
                      .map((color, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`color-${color.id}`}
                            checked={selectedColors.includes(color.name)}
                            onCheckedChange={() =>
                              handleColorSelect(color.name)
                            }
                          />
                          <label
                            htmlFor={`color-${color.id}`}
                            className="text-sm cursor-pointer flex items-center"
                          >
                            <div
                              className="w-4 h-4 rounded-sm mr-2"
                              style={{
                                backgroundColor: color.hex,
                                border: "1px solid #e2e8f0",
                              }}
                            ></div>
                            {color.name}
                          </label>
                        </div>
                      ))}
                    {colors.length > 6 && (
                      <button
                        onClick={() => setShowAllColors(!showAllColors)}
                        className="text-sm text-[#795d2a] hover:underline"
                      >
                        {showAllColors ? "Show Less" : "Show More"}
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <Button
                onClick={clearAllFilters}
                variant="outline"
                className="w-full border-[#795d2a] text-[#795d2a] hover:bg-[#795d2a] hover:text-white"
              >
                Clear All Filters
              </Button>
            </div>

            <div className="md:hidden my-4">
              <Button
                onClick={() => {
                  setIsMobileFilterOpen(false);
                  applyFilters();
                }}
                className="w-full bg-[#795d2a] text-white"
              >
                Apply Filters
              </Button>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-500">
                Showing {products.length} of{" "}
                {productResponse?.pagination?.totalItems || 0} products
              </div>

              <div>
                <div className="relative inline-block">
                  <select
                    className="appearance-none border rounded-md px-4 py-2 pr-8 focus:outline-none text-sm"
                    value={sortBy}
                    onChange={handleSortChange}
                  >
                    <option value="">Sort by</option>
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.length === 0 && !isLoading ? (
                <div className="col-span-3 text-center py-10">
                  No products found with the selected filters
                </div>
              ) : (
                products.map((product, index) => (
                  <ProductCard
                    key={product.id || index}
                    product={product}
                    wishlistProducts={wishlistProducts || []}
                  />
                ))
              )}
            </div>
            {/* Loading indicator for infinite scroll */}
            <div
              ref={lastProductRef}
              className="mt-10 text-center text-sm text-gray-500"
            >
              {isLoading && currentPage > 1
                ? "Loading more products..."
                : hasMore
                ? "Scroll down to load more"
                : products.length > 0
                ? "No more products"
                : ""}
            </div>
          </div>
        </div>
      </div>
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
      <SiteFooter />
    </main>
  );
}
export function ProductLastSection() {
  return (
    <section className="py-10 border-t">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <Package className="h-10 w-10 mb-3 text-[#795d2a]" />
            <h3 className="font-medium text-base mb-1">Free Shipping</h3>
            <p className="text-sm text-gray-600">
              Free shipping for order above $150
            </p>
          </div>
          <div className="flex flex-col items-center">
            <RefreshCw className="h-10 w-10 mb-3 text-[#795d2a]" />
            <h3 className="font-medium text-base mb-1">Money Guarantee</h3>
            <p className="text-sm text-gray-600">
              Within 30 days for an exchange
            </p>
          </div>
          <div className="flex flex-col items-center">
            <HeadphonesIcon className="h-10 w-10 mb-3 text-[#795d2a]" />
            <h3 className="font-medium text-base mb-1">Online Support</h3>
            <p className="text-sm text-gray-600">
              24 hours a day, 7 days a week
            </p>
          </div>
          <div className="flex flex-col items-center">
            <CreditCard className="h-10 w-10 mb-3 text-[#795d2a]" />
            <h3 className="font-medium text-base mb-1">Flexible Payment</h3>
            <p className="text-sm text-gray-600">
              Pay with multiple credit cards
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ProductCard component remains the same
function ProductCard({
  product,
  wishlistProducts,
}: {
  product: Products;
  wishlistProducts: any[];
}) {
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: customerApi.getCustomer,
  });

  const [isProductInWishlist, setIsProductInWishlist] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (wishlistProducts) {
      setIsProductInWishlist(wishlistProducts.includes(product.id));
    }
  }, [wishlistProducts]);

  const addToWishlist = useMutation({
    mutationFn: () => wishlistApi.addtoWishlist(product.id),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistProducts"] });
      toast.success(`${product.name} has been added to your wishlist.`);
    },
    onError: () => {
      toast.error("Failed to add product to wishlist.");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: () => wishlistApi.removeFromWishlist(product.id),
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistProducts"] });
      toast.success(`${product.name} has been removed from your wishlist.`);
    },
    onError: () => {
      toast.error("Failed to remove product from wishlist.");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  const handleWishlistToggle = () => {
    if (loading) return;
    if (!user) {
      toast.error("You need to login to manage your wishlist.");
      return;
    }

    if (isProductInWishlist) {
      removeFromWishlist.mutate();
    } else {
      addToWishlist.mutate();
    }
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;

    try {
      setIsAddingToCart(true);
      const productData = await productApi.getById(product.id);

      const defaultColor = productData.colors?.[0]?.color || "";
      const defaultSizeData = productData.colors?.[0]?.sizes?.find(
        (size) => size.stock > 0
      );
      if (!defaultSizeData) {
        toast.error("This product is out of stock.");
        return;
      }
      const defaultSize = defaultSizeData?.size || "SIZE_DEFAULT";
      const defaultVariantId = defaultSizeData?.id || "ID_NOT_FOUND";
      const defaultImage = product.assets?.[0]?.asset_url || "/placeholder.svg";

      const cartItem = {
        id: product.id,
        name: product.name,
        price: product.discountPrice || product.price,
        originalPrice: product.price,
        quantity: 1,
        color: defaultColor,
        size: defaultSize,
        productVariantId: defaultVariantId,
        image: defaultImage,
      };

      addToCart(cartItem);
      toast.success(`${product.name} has been added to your cart.`);
    } catch (error) {
      toast.error("Failed to fetch product details. Please try again.");
      console.error("Add to cart error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="group relative">
      <div className="aspect-[3/4] relative overflow-hidden rounded-xl bg-gray-100">
        <Link href={`/product/${product.slug}`}>
          <Image
            src={product.assets[0]?.asset_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>
        <button
          onClick={handleWishlistToggle}
          disabled={loading}
          className="absolute top-3 right-3 aspect-square w-8 bg-[#795D2A] rounded-full flex items-center justify-center 
          lg:opacity-0 group-hover:opacity-100 transition-all duration-300 transform lg:translate-x-[100%] group-hover:translate-x-0"
        >
          {isProductInWishlist ? (
            <HeartOff className="aspect-square w-4 lg:w-6 text-white" />
          ) : (
            <Heart className="aspect-square w-4 lg:w-6 text-white" />
          )}
        </button>

        <div
          className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 w-full
          transform lg:translate-y-full group-hover:translate-y-0 
          transition-transform duration-300 ease-in-out"
        >
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full flex justify-center gap-4 items-center rounded-lg bg-[#795D2A] text-white text-lg font-normal py-2 
            lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            {isAddingToCart ? (
              <>
                Adding...
                <span className="animate-spin">
                  <RefreshCw className="h-5 w-5" />
                </span>
              </>
            ) : (
              <>
                Add to Cart
                <Briefcase />
              </>
            )}
          </button>
        </div>
      </div>
      <div className="mt-3">
        <Link href={`/product/${product.slug}`} className="block">
          <h3 className="text-sm font-medium">{product.name}</h3>
        </Link>
        <h3 className="text-sm font-medium">{product.sku}</h3>
        <div className="flex items-center mt-1">
          <span className="text-sm font-medium">
            ₹{product.discountPrice || product.price}
          </span>
          {product.discountPrice && product.discountPrice < product.price && (
            <span className="text-xs text-gray-500 line-through ml-2">
              ₹{product.price}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

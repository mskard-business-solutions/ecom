"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useCart } from "@/context/cart-context";
import MiniCart from "@/components/mini-cart";
import { useQuery } from "@tanstack/react-query";
import { customerApi } from "@/lib/api/customer";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { productApi } from "@/lib/api/productdetails";

export default function Navbar() {
  const router = useRouter();
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: customerApi.getCustomer,
  });
  const cartContext = useCart();
  const cartItems = cartContext?.cartItems || [];
  const cartCount = cartContext?.cartCount || 0;
  const removeFromCart = cartContext?.removeFromCart || ((id: string) => {});
  const updateQuantity =
    cartContext?.updateQuantity || ((id: string, quantity: number) => {});
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle click outside of search dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMiniCart = () => {
    setIsMiniCartOpen(!isMiniCartOpen);
    if (!isMiniCartOpen) {
      setIsMobileMenuOpen(false); // Close mobile menu if opening cart
      setIsSearchOpen(false); // Close search if opening cart
    }
  };
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      setIsMiniCartOpen(false); // Close cart if opening mobile menu
      setIsSearchOpen(false); // Close search if opening mobile menu
    }
  };
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setIsMobileMenuOpen(false); // Close mobile menu if opening search
      setIsMiniCartOpen(false); // Close cart if opening search
    }
  };
  // Searching products
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Get search results from API
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["products", currentPage, itemsPerPage, debouncedSearchTerm],
    queryFn: () =>
      productApi.getProducts(currentPage, itemsPerPage, debouncedSearchTerm, { status: "PUBLISHED" }),
    enabled: !!debouncedSearchTerm && debouncedSearchTerm.length >= 2,
  });
  // Save search to history when user clicks on a product
  const saveSearchToHistory = (term: string) => {
    if (typeof window !== "undefined" && term) {
      const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
      // Remove if already exists (to move it to top)
      const filteredHistory = history.filter((h: string) => h !== term);
      // Add to beginning of array (most recent first)
      const newHistory = [term, ...filteredHistory].slice(0, 5); // Keep only most recent 5
      localStorage.setItem("searchHistory", JSON.stringify(newHistory));
      localStorage.setItem("lastSearch", term);
    }
  };
  const handleProductClick = (productId: string, productName: string) => {
    saveSearchToHistory(searchTerm);
    setIsSearchOpen(false);
    router.push(`/product/${productId}`);
  };
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm) {
      saveSearchToHistory(searchTerm);
      router.push(`/shop?q=${encodeURIComponent(searchTerm)}`);
      setIsSearchOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <Image
                src="https://res.cloudinary.com/dklqhgo8r/image/upload/v1741713365/omez9tvbpnwgmsnj3q3w.png"
                alt="RAAS The Creation Logo"
                width={120}
                height={50}
                className="h-auto"
              />
            </Link>
          </div>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1">
            <ul className="flex space-x-8 lg:space-x-12">
              <li>
                <Link
                  href="/"
                  className="text-sm font-medium tracking-wide hover:text-[#a08452] transition-colors"
                >
                  HOME
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-sm font-medium tracking-wide hover:text-[#a08452] transition-colors"
                >
                  SHOP
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm font-medium tracking-wide hover:text-[#a08452] transition-colors"
                >
                  ABOUT
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm font-medium tracking-wide hover:text-[#a08452] transition-colors"
                >
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>
          {/* Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Search Icon & Dropdown */}
            <div className="relative w-full" ref={searchRef}>
              <button
                aria-label="Search"
                className="focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
                onClick={toggleSearch}
              >
                <Search className="h-5 w-5" />
              </button>
              {/* Search Dropdown */}
              {isSearchOpen && (
                <div className="absolute -left-10 transform -translate-x-1/2 md:transform-none md:left-auto md:right-0 mt-2 w-[90vw] md:w-[600px] bg-white border border-gray-200 rounded-md shadow-lg p-3 z-50">
                  <form
                    onSubmit={handleSearchSubmit}
                    className="flex items-center"
                  >
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#a08452] focus:border-[#a08452]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="bg-[#a08452] text-white px-4 py-3 rounded-r-md text-sm hover:bg-[#8a7245] transition-colors"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                  {/* Search Results */}
                  {debouncedSearchTerm && debouncedSearchTerm.length >= 2 && (
                    <div className="mt-3">
                      {isLoading ? (
                        <div className="py-3 text-center text-gray-500">
                          <div className="animate-pulse">Searching...</div>
                        </div>
                      ) : searchResults?.products && searchResults.products.length > 0 ? (
                        <div>
                          <p className="text-gray-500 mb-2 text-xs">
                            Products ({searchResults.products.length})
                          </p>
                          <div className="grid grid-cols-2 gap-2 max-h-[70vh] overflow-y-auto">
                            {searchResults.products.map((product) => (
                              <div
                                key={product.id}
                                className="border border-gray-100 rounded-md p-2 cursor-pointer hover:border-[#a08452] transition-colors"
                                onClick={() => handleProductClick(product.slug, product.name)}
                              >
                                <div className="aspect-square w-full overflow-hidden rounded-md bg-gray-100 mb-2">
                                  {product.assets && product.assets[0]?.asset_url ? (
                                    <Image
                                      src={product.assets[0]?.asset_url}
                                      alt={product.name}
                                      width={100}
                                      height={100}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                      <span className="text-xs text-gray-400">No image</span>
                                    </div>
                                  )}
                                </div>
                                <h3 className="text-xs font-medium truncate">
                                  {product.name}
                                </h3>
                                <p className="text-xs text-[#a08452] mt-1">
                                  ₹{product.price?.toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 text-center text-gray-500">
                          No products found
                        </div>
                      )}
                    </div>
                  )}
                  {/* Search History */}
                  {!debouncedSearchTerm && (() => {
                    // Only execute in client-side
                    if (typeof window !== "undefined") {
                      const searchHistory = JSON.parse(
                        localStorage.getItem("searchHistory") || "[]"
                      );
                      if (searchHistory.length > 0) {
                        return (
                          <div className="mt-3 pt-2 border-t border-gray-100">
                            <p className="text-gray-500 mb-1">
                              Recent searches
                            </p>
                            <ul className="space-y-1">
                              {searchHistory.map(
                                (search: string, index: number) => (
                                  <li key={index}>
                                    <button
                                      className="text text-gray-700 hover:text-[#a08452] flex items-center w-full text-left"
                                      onClick={() => {
                                        setSearchTerm(search);
                                        localStorage.setItem(
                                          "lastSearch",
                                          search
                                        );
                                        router.push(
                                          `/shop?q=${encodeURIComponent(
                                            search
                                          )}`
                                        );
                                        setIsSearchOpen(false);
                                      }}
                                    >
                                      <Search className="h-3 w-3 mr-2 text-gray-400" />
                                      {search}
                                    </button>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
            <Link
              href={user ? "/account/wishlists" : "/signin"}
              aria-label="Wishlist"
              className="focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <button
              aria-label="Cart"
              className="focus:outline-none relative p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={toggleMiniCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#a08452] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <Link
              href={user ? "/account/orders" : "/signin"}
              aria-label="Account"
              className="focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-3">
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="block py-2 text-sm font-medium hover:text-[#a08452] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  HOME
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="block py-2 text-sm font-medium hover:text-[#a08452] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  SHOP
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block py-2 text-sm font-medium hover:text-[#a08452] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ABOUT
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block py-2 text-sm font-medium hover:text-[#a08452] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  CONTACT
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
      {/* Mini Cart */}
      <MiniCart
        isOpen={isMiniCartOpen}
        onClose={() => setIsMiniCartOpen(false)}
        cartItems={cartItems}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
      />
    </header>
  );
}
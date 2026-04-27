"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  Mail,
  Phone,
  X,
  Search,
  Key,
  Loader,
  Loader2,
  User,
  CheckCircle,
  XCircle,
  MapPin,
  Heart,
  Package,
} from "lucide-react";
import { customerApi } from "@/lib/api/customer";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";

interface Customer {
  id: string;
  name: string;
  email: string;
  mobile_no: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

interface Customer2 {
  id: string;
  name: string;
  email: string | null;
  mobile_no: string;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  isEmailVerified: boolean;
  emailVerified: string | null;
  isPhoneNoVerified: boolean;
  phoneNoVerified: string | null;
  Address: {
    id: string;
    firstName: string;
    lastName: string;
    addressName: string;
    phoneNumber: string;
    street: string;
    aptNumber: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }[];
  Wishlist: {
    product: {
      id: string;
      name: string;
      price: number;
      discountPrice: number;
      assets: {
        asset_url: string;
      }[];
    };
  }[];
  Order: {
    id: string;
    total: number;
    status: string;
    createdAt: string;
    items: {
      productName: string;
      priceAtOrder: number;
      quantity: number;
      size: string;
      color: string;
      productImage: string;
    }[];
  }[];
}

export function CustomerTable() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer2 | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [isEmailVerified, setIsEmailVerified] = useState<string>("all");
  const [isPhoneNoVerified, setIsPhoneNoVerified] = useState<string>("all");
  const [hasOrders, setHasOrders] = useState<string>("all");
  const [createdFrom, setCreatedFrom] = useState<string>("");
  const [createdTo, setCreatedTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [loadingCustomerId, setLoadingCustomerId] = useState<string | null>(
    null
  );

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "customers",
      currentPage,
      itemsPerPage,
      debouncedSearchTerm,
      isEmailVerified,
      isPhoneNoVerified,
      hasOrders,
      createdFrom,
      createdTo,
    ],
    queryFn: async () => {
      const response = await customerApi.getAllCustomers(
        currentPage,
        itemsPerPage,
        debouncedSearchTerm,
        {
          isEmailVerified,
          isPhoneNoVerified,
          hasOrders,
          createdFrom,
          createdTo,
        }
      );
      return response.data;
    },
  });

  const getUserDetails = async (customerId: string) => {
    try {
      const response = await customerApi.getCustomerByID(customerId);
      return response.data;
    } catch (error) {
      console.error("Error fetching user details:", error);
      return null;
    }
  };

  const openCustomerDetails = async (customerId: string) => {
    setLoadingCustomerId(customerId);

    const userDetails = await getUserDetails(customerId);
    setSelectedCustomer(userDetails);
    setLoadingCustomerId(null);
  };

  const handlePasswordChange = async () => {
    try {
      if (selectedCustomerId && newPassword) {
        await customerApi.changePassword(selectedCustomerId, newPassword);
        setShowPasswordModal(false);
        setNewPassword("");
        setSelectedCustomerId(null);
      }
    } catch (error) {
      console.error("Failed to change password:", error);
    }
  };

  const openPasswordModal = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setShowPasswordModal(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };
  const Section = ({ title, fullWidth, children }: { title: string; fullWidth?: boolean; children: React.ReactNode }) => (
  <section className={`${fullWidth ? "col-span-2" : ""}`}>
    <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-gray-700">
      {title === "User Info" && <User size={18} />}
      {title === "Verification" && <CheckCircle size={18} />}
      {title === "Addresses" && <MapPin size={18} />}
      {title === "Wishlist" && <Heart size={18} />}
      {title === "Orders" && <Package size={18} />}
      {title}
    </h3>
    {children}
  </section>
);

  const Info = ({
    label,
    value,
  }: {
    label: string;
    value: string | number;
  }) => {
    const isVerified = value === "Yes";
  return (
    <div className="flex items-center gap-2 mb-2">
      <span className="font-semibold w-32">{label}:</span>
      {label.includes("Verified") ? (
        isVerified ? (
          <CheckCircle className="text-green-600" size={16} />
        ) : (
          <XCircle className="text-red-600" size={16} />
        )
      ) : (
        <span>{value}</span>
      )}
    </div>
  );

  }
  return (
    <div className="">
      <div className="relative bg-white p-4 rounded-xl shadow-sm space-y-4">
        {/* Search Box */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          {searchTerm && (
            <X
              className="absolute right-3 top-2.5 text-gray-400 cursor-pointer"
              size={20}
              onClick={() => setSearchTerm("")}
            />
          )}
        </div>

        {/* Toggle Filters */}
        <button
          className="text-sm text-indigo-600 hover:underline font-medium"
          onClick={() => setShowFilters((prev) => !prev)}>
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        {/* Filter Panel */}
        {showFilters && (
          <div className="space-y-2">
            <h2 className="text-md font-semibold text-gray-700">
              Filter Customers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Phone Verified */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Verified
                </label>
                <select
                  value={isPhoneNoVerified}
                  onChange={(e) => setIsPhoneNoVerified(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="all">All</option>
                  <option value="true">Verified</option>
                  <option value="false">Unverified</option>
                </select>
              </div>

              {/* Has Orders */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Has Orders
                </label>
                <select
                  value={hasOrders}
                  onChange={(e) => setHasOrders(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="all">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {/* Created From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created From
                </label>
                <input
                  type="date"
                  value={createdFrom}
                  onChange={(e) => setCreatedFrom(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Created To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created To
                </label>
                <input
                  type="date"
                  value={createdTo}
                  onChange={(e) => setCreatedTo(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
      {selectedCustomer && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          aria-modal="true"
          role="dialog"
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-6xl p-6 overflow-y-auto max-h-[90vh] relative"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">User Details</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-gray-800 transition"
                aria-label="Close modal"
              >
                <X size={28} />
              </button>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Section title="User Info">
                <Info label="Name" value={selectedCustomer.name} />
                <Info label="Phone" value={selectedCustomer.mobile_no} />
              </Section>

              {/* Verification */}
              <Section title="Verification">
                <Info
                  label="Email Verified"
                  value={selectedCustomer.isEmailVerified ? "Yes" : "No"}
                />
                <Info
                  label="Phone Verified"
                  value={selectedCustomer.isPhoneNoVerified ? "Yes" : "No"}
                />
              </Section>

              {/* Wishlist */}
              <Section title="Wishlist" fullWidth>
                <div className="overflow-x-auto">
                  <div className="flex gap-3 min-w-max">
                    {selectedCustomer.Wishlist.map((item, idx) => (
                      <div
                        key={`${item.product.id}-${idx}`}
                        className="p-2 border rounded-lg bg-white shadow-sm flex flex-col items-center min-w-[120px]"
                      >
                        <img
                          src={item.product.assets[0].asset_url}
                          alt={item.product.name}
                          className="w-16 h-20 object-cover rounded mb-1"
                          loading="lazy"
                        />
                        <div className="text-center">
                          <p className="font-medium text-sm leading-tight">
                            {item.product.name}
                          </p>
                          <p className="text-gray-400 line-through text-xs mt-0.5">
                            ₹{item.product.price}
                          </p>
                          <p className="text-green-600 font-bold text-xs">
                            ₹{item.product.discountPrice}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>

              {/* Orders */}
              <Section title="Orders" fullWidth>
                <div className="overflow-x-auto">
                  <div className="flex gap-3 min-w-max">
                    {selectedCustomer.Order.map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-3 bg-gray-50 shadow-sm min-w-[350px]"
                      >
                        <div className="flex flex-wrap justify-between text-sm font-semibold mb-2">
                          <span>Order ID: {order.id}</span>
                          <span>Status: {order.status}</span>
                          <span>Total: ₹{order.total}</span>
                        </div>
                        <div className="grid gap-2">
                          {order.items.map((item, idx) => (
                            <div
                              key={`${item.productName}-${idx}`}
                              className="bg-white p-2 border rounded flex items-center gap-3"
                            >
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="w-16 h-20 object-cover rounded flex-shrink-0"
                                loading="lazy"
                              />
                              <div className="flex flex-col text-xs space-y-0.5 flex-grow min-w-0">
                                <p className="font-semibold truncate">{item.productName}</p>
                                <div className="flex flex-wrap gap-x-3 text-gray-700">
                                  <span>Size: {item.size}</span>
                                  <span>Color: {item.color}</span>
                                  <span>Qty: {item.quantity}</span>
                                </div>
                                <p className="text-green-700 font-bold">₹{item.priceAtOrder}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
              {/* Addresses */}
              <Section title="Addresses" fullWidth>
                <div className="overflow-x-auto">
                  <div className="flex gap-4 min-w-max">
                    {selectedCustomer.Address.map((addr) => (
                      <div
                        key={addr.id}
                        className="border p-4 rounded-lg bg-gray-50 min-w-[300px]"
                      >
                        <p className="font-semibold">{addr.addressName}</p>
                        <p>
                          {addr.firstName} {addr.lastName}
                        </p>
                        <p>
                          {addr.aptNumber}, {addr.street}
                        </p>
                        <p>
                          {addr.city}, {addr.state} - {addr.zipCode}
                        </p>
                        <p>{addr.country}</p>
                        <p className="text-sm text-gray-600 mt-2">{addr.phoneNumber}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            <input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="bg-white shadow-sm rounded-lg p-4 text-center">
          <p className="text-gray-500">Loading customers...</p>
        </div>
      ) : error ? (
        <div className="bg-white shadow-sm rounded-lg p-4 text-center">
          <p className="text-red-500">Failed to load customers</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {/* Desktop Table View - Hidden on small screens */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S No.
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Orders
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Order
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data?.map((customer: Customer, index: number) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1 + (currentPage-1) * itemsPerPage}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {customer.name}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {customer.mobile_no}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {customer.totalOrders}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      ₹{customer.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(customer.lastOrderDate)}
                    </td>
                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openPasswordModal(customer.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-full hover:bg-indigo-50"
                          aria-label="Change password">
                          <Key size={18} />
                        </button>
                        <button
                          onClick={() => openCustomerDetails(customer.id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-full hover:bg-indigo-50"
                          aria-label="Change password">
                          {loadingCustomerId === customer.id ? (
                            <Loader2 className="animate-spin" size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View - Only visible on small screens */}
          <div className="md:hidden">
            <div className="divide-y divide-gray-200">
              {data?.data?.map((customer: Customer, index: number) => (
                <div key={customer.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-sm text-gray-500 mr-2">#{index + 1 + (currentPage-1) * itemsPerPage}</span>
                      <h3 className="text-sm font-medium text-gray-900 inline">
                        {customer.name}
                      </h3>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openPasswordModal(customer.id)}
                        className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-full hover:bg-indigo-50"
                        aria-label="Change password">
                        <Key size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 mb-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone size={14} className="mr-1.5 text-gray-400" />
                      <span>{customer.mobile_no}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-gray-400">Orders</p>
                      <p className="font-medium">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Spent</p>
                      <p className="font-medium">
                        ₹{customer.totalSpent.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last Order</p>
                      <p className="font-medium">
                        {formatDate(customer.lastOrderDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Controls */}
          <div className="bg-white p-3 sm:p-4 rounded-lg shadow">
            {/* Items per page - Stacked on mobile, side by side on larger screens */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="w-full sm:w-auto">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-gray-700">
                  <option value="5">5 per page</option>
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                </select>
              </div>

              {/* Pagination - Simplified on mobile */}
              <div className="flex items-center justify-center w-full sm:w-auto">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-2 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="hidden sm:inline ml-1">Previous</span>
                </button>

                <div className="hidden sm:flex items-center mx-2 space-x-1">
                  {Array.from(
                    { length: Math.min(5, data?.pagination?.totalPages || 1) },
                    (_, i) => {
                      let pageNum;
                      const totalPages = data?.pagination?.totalPages || 1;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                            currentPage === pageNum
                              ? "bg-indigo-600 text-white font-medium shadow-md"
                              : "border border-gray-300 hover:bg-gray-50 text-gray-700"
                          }`}>
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <span className="mx-2 text-sm sm:hidden">
                  Page {currentPage} of {data?.pagination?.totalPages || 1}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, data?.pagination?.totalPages || 1)
                    )
                  }
                  disabled={currentPage === (data?.pagination?.totalPages || 1)}
                  className="px-2 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 flex items-center">
                  <span className="hidden sm:inline mr-1">Next</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

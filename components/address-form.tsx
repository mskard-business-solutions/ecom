"use client";
import { useEffect, useState } from "react";
import type React from "react";
import axios from "axios";
import { Home, Briefcase, MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AddressApi } from "@/lib/api/address";
import { AddressType } from "@/types/types";

export default function AddressForm() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    flat: "",
    area: "",
    city: "",
    pincode: "",
    state: "",
    country: "",
    addressName: "Home",
  });

  const [errors, setErrors] = useState({
    name: "",
    mobile: "",
    flat: "",
    area: "",
    city: "",
    pincode: "",
    state: "",
    country: "",
    addressName: "",
  });

  const [loadingAddress, setLoadingAddress] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddressTypeClick = (type: string) => {
    setFormData(prev => ({ ...prev, addressName: type }));
  };

  // Auto-fill city and state from pincode
  useEffect(() => {
    const fetchFromPincode = async () => {
      if (formData.pincode.length === 6) {
        setLoadingAddress(true);
        try {
          const res = await axios.get(
            `https://api.postalpincode.in/pincode/${formData.pincode}`
          );
          const postOffice = res.data?.[0]?.PostOffice?.[0];
          if (postOffice) {
            setFormData((prev) => ({
              ...prev,
              city: postOffice.District || prev.city,
              state: postOffice.State || prev.state,
              country: postOffice.Country || prev.country,
            }));
          }
        } catch (error) {
          console.error("Pincode lookup failed", error);
        } finally {
          setLoadingAddress(false);
        }
      }
    };

    fetchFromPincode();
  }, [formData.pincode]);


  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
      valid = false;
    } else if (!/^\d{10}$/.test(formData.mobile.trim())) {
      newErrors.mobile = "Please enter a valid 10-digit mobile number";
      valid = false;
    }

    if (!formData.area.trim()) {
      newErrors.area = "Area/Street is required";
      valid = false;
    }

    if (!formData.city) {
      newErrors.city = "City is required";
      valid = false;
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
      valid = false;
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
      valid = false;
    }

    if (!formData.state) {
      newErrors.state = "State is required";
      valid = false;
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const queryClient = useQueryClient();

  const addAddressMutation = useMutation({
    mutationFn: async (address: AddressType) => {
      await AddressApi.addAddress(address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["address"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      addAddressMutation.mutate({
        firstName: formData.name.split(" ")[0],
        lastName: formData.name.split(" ")[1] || "",
        street: formData.area,
        aptNumber: formData.flat,
        city: formData.city,
        zipCode: formData.pincode,
        state: formData.state,
        country: formData.country,
        phoneNumber: formData.mobile,
        addressName: formData.addressName,
      });

      setFormData({
        name: "",
        mobile: "",
        flat: "",
        area: "",
        city: "",
        pincode: "",
        state: "",
        country: "",
        addressName: "Home",
      });
    }
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Add a new address</h2>

      {loadingAddress && (
        <div className="text-sm text-gray-500 mb-4">Fetching location details...</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Address Type
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleAddressTypeClick("Home")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                formData.addressName === "Home"
                  ? "bg-[#795d2a] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Home size={16} />
              Home
            </button>
            <button
              type="button"
              onClick={() => handleAddressTypeClick("Work")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                formData.addressName === "Work"
                  ? "bg-[#795d2a] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Briefcase size={16} />
              Work
            </button>
            <button
              type="button"
              onClick={() => handleAddressTypeClick("Other")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                formData.addressName === "Other"
                  ? "bg-[#795d2a] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <MapPin size={16} />
              Other
            </button>
          </div>
        </div>

        {[
          { label: "Name", id: "name" },
          { label: "Mobile Number", id: "mobile", type: "tel" },
          { label: "Flat, House no., Apartment (Optional)", id: "flat" },
          { label: "Area, Street, Village", id: "area" },
          { label: "Pincode", id: "pincode" },
          { label: "Country", id: "country" },
        ].map(({ label, id, type = "text" }) => (
          <div key={id}>
            <label htmlFor={id} className="block text-sm font-medium mb-1">
              {label}
            </label>
            <input
              type={type}
              id={id}
              name={id}
              value={(formData as any)[id]}
              onChange={handleChange}
              className={`w-full px-4 py-3 border ${
                (errors as any)[id] ? "border-red-500" : "border-gray-300"
              } rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]`}
              aria-invalid={(errors as any)[id] ? "true" : "false"}
              aria-describedby={(errors as any)[id] ? `${id}-error` : undefined}
            />
            {(errors as any)[id] && (
              <p id={`${id}-error`} className="mt-1 text-xs text-red-500">
                {(errors as any)[id]}
              </p>
            )}
          </div>
        ))}

        {/* City Dropdown */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium mb-1">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-3 border ${
              errors.city ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]`}
          />
          {errors.city && (
            <p id="city-error" className="mt-1 text-xs text-red-500">
              {errors.city}
            </p>
          )}
        </div>

        {/* State Dropdown */}
        <div>
          <label htmlFor="state" className="block text-sm font-medium mb-1">
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full px-4 py-3 border ${
              errors.state ? "border-red-500" : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]`}
          />
          {errors.state && (
            <p id="state-error" className="mt-1 text-xs text-red-500">
              {errors.state}
            </p>
          )}
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full md:w-auto px-6 py-3 bg-[#a08452] hover:bg-[#8c703d] text-white rounded"
          >
            Add New Address
          </button>
        </div>
      </form>
    </div>
  );
}

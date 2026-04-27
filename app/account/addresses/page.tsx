"use client";
import { useState } from "react";
import { Plus, PenSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AddressApi } from "@/lib/api/address";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { LoadingAddress } from "@/components/ui/loader";
import { set } from "zod";
import { AddressType } from "@/types/types";

export default function ManageAddressesPage() {
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch addresses
  const { data: addresses, isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: AddressApi.getAddress,
  });
  const openAddressModal = () => setShowAddressModal(true);
  const closeAddressModal = () => setShowAddressModal(false);
  const [formData, setFormData] = useState<AddressType>({
    addressName: "Home",
    firstName: "",
    lastName: "",
    street: "",
    aptNumber: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
    country: "India",
  });
  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleAddressTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, addressName: value }));
  };
  // Add new address
  const handleAddAddress = async () => {
    setIsSubmitting(true);
    try {
      const res = await AddressApi.addAddress(formData);
      if (res.success) {
        toast.success("Address added successfully!");
        await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      closeAddressModal();
    } catch (error) {
      toast.error("Failed to add address");
    } finally {
      setIsSubmitting(false);
    }
  };
  // edit address
  const handleEditAddress = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await AddressApi.editAddress(id, formData);
      if (res.success) {
        toast.success("Address updated successfully!");
        await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      } else {
        toast.error("Failed to update address");
      }
      setEditAddressId(null);
      setFormData({
        addressName: "Home",
        firstName: "",
        lastName: "",
        street: "",
        aptNumber: "",
        city: "",
        state: "",
        zipCode: "",
        phoneNumber: "",
        country: "India",
      });
      closeAddressModal();
    } catch (error) {
      toast.error("Failed to update address");
    } finally {
      setIsSubmitting(false);
    }
  };
  // delete address
  const handleDeleteAddress = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await AddressApi.deleteAddress(id);
      if (res.success) {
        toast.success("Address deleted successfully!");
        await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      } else {
        toast.error("Failed to delete address");
      }
    } catch (error) {
      toast.error("Failed to delete address");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    editAddressId ? handleEditAddress(editAddressId) : handleAddAddress();
  };

  return (
    <>
      {isLoading ? (
        <LoadingAddress />
      ) : (
        <div>
          <Button
            className="bg-[#a08452] hover:bg-[#8c703d] text-white mb-8 flex items-center gap-2"
            onClick={openAddressModal}>
            <Plus className="h-5 w-5" />
            Add New Address
          </Button>
          {addresses?.map((address) => (
            <div key={address.id} className="border-b pb-6 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg mb-2">
                    {address.addressName}
                  </h3>
                  <p className="text-gray-700 mb-1">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-gray-700 mb-1">
                    {address.street}
                    {address.aptNumber ? `, ${address.aptNumber}` : ""}
                  </p>
                  <p className="text-gray-700 mb-1">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-gray-700 mb-1">{address.country}</p>
                  <p className="text-gray-700">{address.phoneNumber}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      openAddressModal();
                      setFormData(address);
                      setEditAddressId(address.id || null);
                    }}
                    disabled={isSubmitting}
                    className="bg-[#a08452] hover:bg-[#8c703d] text-white h-9 px-3 flex items-center gap-1">
                    <PenSquare className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    disabled={isSubmitting}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 h-9 px-3 flex items-center gap-1"
                    onClick={() => address.id && handleDeleteAddress(address.id)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-md max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-medium mb-6">Enter a New Address</h2>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Address Type Selection */}
              <div className="space-y-2">
                <Label>Address Type</Label>
                <RadioGroup
                  value={formData.addressName}
                  onValueChange={handleAddressTypeChange}
                  className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Home" id="home" />
                    <Label htmlFor="home">Home</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Office" id="office" />
                    <Label htmlFor="office">Office</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Other" id="other" />
                    <Label htmlFor="other">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Mobile Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  type="text"
                  required
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required
                  placeholder="Street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aptNumber">
                  Apartment/Suite Number (Optional)
                </Label>
                <Input
                  id="aptNumber"
                  name="aptNumber"
                  value={formData.aptNumber || ""}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, floor, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">PIN Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    required
                    placeholder="6-digit PIN code"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAddressModal}
                  disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#a08452] hover:bg-[#8c703d] text-white">
                  {isSubmitting ? "Loading..." : editAddressId ? "Update Address" : "Add Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

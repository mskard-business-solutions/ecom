"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { PenSquare, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "@/lib/api/customer";
import toast from "react-hot-toast";
import { ProfileSkeleton } from "@/components/ui/loader";
import UploadPopup from "@/components/UploadPopup";

export default function PersonalInformationPage() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobileNo: "",
    email: "",
    profileImage: "",
  });
  const [previewImage, setPreviewImage] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await customerApi.getCustomer();
      return res;
    },
  });
  
  useEffect(() => {
    if (data) {
      setFormData({
        firstName: data?.name?.split(" ")[0] || "",
        lastName: data?.name?.split(" ")[1] || "",
        mobileNo: data?.mobile_no || "",
        email: data?.email || "",
        profileImage: data?.image || "",
      });
      
      if (data?.image) {
        setPreviewImage(data.image);
      }
    }
  }, [data, isLoading]);

  const updateCustomerMutation = useMutation({
    mutationFn: async (updatedData : any) => {
      return await customerApi.updateCustomer(data.id, updatedData);
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      setIsEditing(false);
    },
  });

  const handleEditProfile = () => {
    if (isEditing) {
      // Save the changes
      const updatedData = {
        name: `${formData.firstName} ${formData.lastName}`,
        mobile_no: data.mobile_no,
        email: formData.email,
        profile_image: formData.profileImage || data?.image,
      };

      updateCustomerMutation.mutate(updatedData);
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUploadSuccess = (imageUrl: string) => {
    setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
    setPreviewImage(imageUrl);
    setShowUploadPopup(false);
    queryClient.invalidateQueries({ queryKey: ["user"] });
  };

  const handleImageClick = () => {
      setShowUploadPopup(true);
  };

  if (isLoading) {
    return <ProfileSkeleton/>
  }

  return (
    <>
      <div className="flex justify-between items-start mb-8">
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-full overflow-hidden cursor-pointer"
            onClick={handleImageClick}
          >
            <Image
              src={previewImage || "/placeholder.svg?height=96&width=96"}
              alt="Profile Picture"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
            <div 
              className="absolute bottom-0 right-0 bg-[#a08452] text-white p-1 rounded-full cursor-pointer"
              onClick={handleImageClick}
            >
             <PenSquare className="h-4 w-4" />
            </div>
        </div>

        <Button
          className="bg-[#a08452] hover:bg-[#8c703d] text-white"
          onClick={handleEditProfile}
          disabled={updateCustomerMutation.isPending}
        >
          {updateCustomerMutation.isPending
            ? "Saving..."
            : isEditing
            ? "Save Profile"
            : "Edit Profile"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#a08452] ${
              isEditing ? "bg-white" : "bg-gray-50"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#a08452] ${
              isEditing ? "bg-white" : "bg-gray-50"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="mobileNo"
            value={formData.mobileNo.substring(2,12)}
            onChange={handleInputChange}
            readOnly={true}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#a08452] bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            readOnly={!isEditing}
            className={`w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#a08452] ${
              isEditing ? "bg-white" : "bg-gray-50"
            }`}
          />
        </div>
      </div>

      {/* Upload Popup */}
      {showUploadPopup && (
        <UploadPopup 
          onSuccess={handleImageUploadSuccess} 
          onClose={() => setShowUploadPopup(false)} 
        />
      )}
    </>
  );
}
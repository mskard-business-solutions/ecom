"use client";
import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/axiosClient";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";
export default function ContactPage() {
  // Validation schema for form
  const Schema = Yup.object({
    name: Yup.string().min(3).required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.number().min(10).required("Phone number is required"),
    message: Yup.string().required("Message is required"),
  });
  // Formik setup
  const {
    values,
    handleChange,
    handleBlur,
    handleSubmit,
    errors,
    touched,
    isSubmitting,
  } = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
    validationSchema: Schema,
    onSubmit: async (values, action) => {
      try {
        const response = await apiClient.post("/api/send", values);
        toast.success(response.data.message);
        action.resetForm();
      } catch (error) {}
    },
  });
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-medium mb-8 text-center">Contact Us</h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-xl font-medium mb-4">Get In Touch</h2>
            <p className="text-gray-600 mb-6">
              Have questions about our products or your order? We're here to
              help. Fill out the form and we'll get back to you as soon as
              possible.
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-1">Email</h3>
                <p className="text-gray-600">Raasthecreation@gmail.com</p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Store Address</h3>
                <p className="text-gray-600">
                  204/2-c & d, basement, jeewan nagar,
                  <br />
                  ashram, New Delhi-110014
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-1">Working Hours</h3>
                <p className="text-gray-600">
                  Monday to Saturday: 10:00 AM - 7:00 PM
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
          {/* form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                className={`w-full ${
                  errors.name && touched.name
                    ? "border-red-400"
                    : "border-gray-300"
                } px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]`}
                placeholder="Enter your name"
              />
              {errors.name && touched.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                className={`w-full ${
                  errors.name && touched.name
                    ? "border-red-400"
                    : "border-gray-300"
                } px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]`}
                placeholder="Enter your email"
              />
              {errors.email && touched.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Phone Number
              </label>
              <input
                type="number"
                id="phone"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.phone}
                className={`w-full ${
                  errors.name && touched.name
                    ? "border-red-400"
                    : "border-gray-300"
                } px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]`}
                placeholder="Enter phone"
              />
              {errors.phone && touched.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1"
              >
                Message
              </label>
              <textarea
                id="message"
                rows={5}
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.message}
                className={`w-full ${
                  errors.name && touched.name
                    ? "border-red-400"
                    : "border-gray-300"
                } px-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#795d2a]`}
                placeholder="Enter your message"
              ></textarea>
              {errors.message && touched.message && (
                <p className="text-red-400 text-xs mt-1">{errors.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#795d2a] hover:bg-[#705526] text-white px-6 py-2 w-full"
            >
              Send Message
            </Button>
          </form>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}

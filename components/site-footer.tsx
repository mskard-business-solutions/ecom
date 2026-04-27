import { Mail, MapPin, PhoneCall } from "lucide-react";
export default function SiteFooter() {
  return (
    <footer className="bg-[#fff3e3] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div>
            <a href="/" className="inline-block mb-4">
              <img
                src="https://res.cloudinary.com/dklqhgo8r/image/upload/v1741713365/omez9tvbpnwgmsnj3q3w.png"
                alt="RAAS The Creation Logo"
                className="h-12 w-auto"
              />
            </a>
            <p className="text-sm text-gray-700 mb-6 max-w-xs">
              Pick up stuff that you'll grow to absolutely love, love, love!
              Trending designs, soothing colours, fashionable prints and
              oh-so-soft fabrics that will fit you, fit into your wardrobe and
              your budget.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://www.instagram.com/raaskurties"
                className="w-8 h-8 rounded-full border border-[#795d2a] flex items-center justify-center text-[#795d2a] hover:bg-[#795d2a] hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@RaasThecreation"
                className="w-8 h-8 rounded-full border border-[#795d2a] flex items-center justify-center text-[#795d2a] hover:bg-[#795d2a] hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/"
                  className="text-gray-700 hover:text-[#795d2a] transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/shop"
                  className="text-gray-700 hover:text-[#795d2a] transition-colors"
                >
                  Shop
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-gray-700 hover:text-[#795d2a] transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-700 hover:text-[#795d2a] transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-gray-700 hover:text-[#795d2a] transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms&cond"
                  className="text-gray-700 hover:text-[#795d2a] transition-colors"
                >
                  Terms & Conditions
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-medium mb-4">Support</h3>
            <ul className="space-y-3">
              <li className="text-gray-700 flex items-center">
                <Mail className="mr-2 text-lg" />
                <span>Raasthecreation@gmail.com</span>
              </li>
              <li className="text-gray-700 flex items-center">
                <MapPin className="mr-2 text-lg" />
                <span className="flex-1">
                  204/2-c & d, basement, jeewan nagar, ashram, New Delhi-110014
                </span>
              </li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h3 className="text-lg font-medium mb-4">Get In Touch</h3>
            <p className="text-gray-700 mb-4">
              Sign up for our newsletter and get the latest updates, news and
              product offers via email.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 px-3 py-2 border border-gray-300 focus:outline-none text-sm rounded-l-md"
              />
              <button className="bg-[#795d2a] hover:bg-[#705526] text-white px-3 py-2 rounded-r-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-4 border-t border-[#e5d9c3] text-center sm:text-left">
          <p className="text-sm text-gray-700">
            © RAAS CREATION | 2025 | ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}

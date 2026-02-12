"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { label: "Dashboard", path: "/" },
    { label: "All Customers", path: "/customers" },
    { label: "Priority List", path: "/priority" },
    { label: "Analytics", path: "/analytics" },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img
                src="/logo-light.svg"
                alt="Molin AI"
                className="h-8"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User Info */}
          <div className="flex items-center">
            <div className="text-sm text-right mr-3">
              <div className="font-medium text-gray-900">CSM Team</div>
              <div className="text-gray-500">Molin AI</div>
            </div>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">CS</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

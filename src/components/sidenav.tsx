"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Doctors", href: "/dashboard/doctors", icon: "👨‍⚕️" },
  { label: "Receptionists", href: "/dashboard/receptionists", icon: "💼" },
  { label: "Patients", href: "/dashboard/patients", icon: "🩺" },
];

export function Sidenav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo / Brand */}
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚕️</span>
          <div>
            <h1 className="text-lg font-bold text-gray-900">MediAssist</h1>
            <p className="text-xs text-gray-500">Clinic OS</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive(item.href)
                ? "bg-blue-50 text-blue-700"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">© 2026 MediAssist AI</p>
      </div>
    </aside>
  );
}
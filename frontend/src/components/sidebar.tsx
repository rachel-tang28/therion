"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Settings, User, Menu, LogOut } from "lucide-react";
import clsx from "clsx";

const menuItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Logout", icon: LogOut, href: "/logout" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={clsx(
        "h-screen bg-gray-900 text-white transition-all duration-200 flex flex-col overflow-hidden",
        collapsed ? "w-[60px]" : "w-[280px]"  // 1/12 for collapsed, 3/12 for expanded
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {/* Handle text overflow with max-w-full for expanded and truncate for collapsed */}
        <div className={clsx("flex-1", collapsed ? "overflow-hidden" : "whitespace-nowrap")}>
          {!collapsed && (
            <h1 className="text-xl font-bold truncate" style={{ maxWidth: "calc(100% - 32px)" }}>
              Therion 🦁
            </h1>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition"
        >
          <Menu />
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map(({ name, icon: Icon, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={name}
              href={href}
              className={clsx(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition",
                isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800",
              )}
            >
              <Icon className="w-5 h-5" />
              {!collapsed && <span>{name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

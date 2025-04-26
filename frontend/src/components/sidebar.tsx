"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import clsx from "clsx";
import Image from "next/image";

const menuItems = [
  { name: "Dashboard", activeSrc: "/white-key-square.svg", src: "/grey-key-square.svg", href: "/" },
  { name: "Projects", activeSrc: "/white-cube.svg", src: "/grey-cube.svg", href: "/projects" },
  { name: "Settings", activeSrc: "/white-star.svg", src: "/grey-star.svg", href: "/settings" },
  { name: "Help", activeSrc: "/white-help.svg", src: "/grey-help.svg", href: "/help" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className={clsx(
        "h-screen sidebar transition-all duration-200 flex flex-col overflow-hidden",
        collapsed ? "w-[60px]" : "w-[280px] p-[16px]"  // 1/12 for collapsed, 3/12 for expanded
      )}
    >
      <div className={clsx("flex flex-row items-center justify-between p-[8px] border-gray-700 w-full", collapsed ? "justify-between" : "border-red-700")}>
        <div className={clsx("flex-1", collapsed ? "overflow-hidden" : "whitespace-nowrap")}>
          {!collapsed && (
            <div className="flex flex-row w-full justify-start items-baseline gap-[8px]">
              <h1 className="sidebar-heading">
                Therion 🦁
              </h1>
              <h2 className="sidebar-version">
                v1.0
              </h2>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={clsx("text-gray-400 hover:opacity-[60%] transition w-full h-full flex rounded-md", !collapsed ? "items-center justify-end" : "pt-[8px] justify-center items-center")}
        >
          {!collapsed ? (
            <Menu/>
          ) : (
            <h2 className="sidebar-heading">🦁</h2>
          )}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {menuItems.map(({ name, activeSrc, src, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={name}
              href={href}
              className={clsx(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition",
                isActive ? "sidebar-active-item-box sidebar-active-item-heading" : "sidebar-item-heading",
              )}
            >
              <Image src={isActive ? activeSrc : src} alt={name} width={24} height={24} priority/>
              {!collapsed && <span>{name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

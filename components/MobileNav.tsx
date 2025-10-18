"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";

interface MobileNavProps {
  isConnected: boolean;
  address?: string;
}

export default function MobileNav({ isConnected, address }: MobileNavProps) {
  const pathname = usePathname();
  
  const navItems = [
    {
      href: "/",
      label: "Home",
      icon: "🏠",
      activeIcon: "🏠"
    },
    {
      href: "/matches",
      label: "Matches",
      icon: "⚽",
      activeIcon: "⚽"
    },
    {
      href: "/positions",
      label: "Positions",
      icon: "📈",
      activeIcon: "📈"
    },
    {
      href: "/marketplace",
      label: "Marketplace",
      icon: "🏪",
      activeIcon: "🏪"
    }
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="mobile-header safe-area-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">PreStake</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs text-gray-600 font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            ) : (
              <ConnectWallet />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="mobile-nav safe-area-bottom">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "mobile-nav-item-active" : "mobile-nav-item-inactive"}
              >
                <span className="text-lg mb-1">
                  {active ? item.activeIcon : item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

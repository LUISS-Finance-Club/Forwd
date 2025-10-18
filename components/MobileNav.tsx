"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-top">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">⚽</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">PreStake</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Badge variant="secondary" className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-mono">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </Badge>
            ) : (
              <ConnectWallet />
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 safe-area-bottom">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center space-y-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <span className="text-2xl mb-1">
                {active ? item.activeIcon : item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
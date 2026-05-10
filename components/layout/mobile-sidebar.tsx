"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Menu, Wallet } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="p-0 w-64">
        <div className="flex flex-col h-full bg-white">
          {/* Logo */}

          <SheetHeader className="p-0">
            <SheetTitle className="text-lg font-semibold text-gray-900">
              <div className="flex items-center gap-2 px-6 py-5">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-lg">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  FinanceTrack
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <Separator />

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0",
                      isActive ? "text-green-600" : "text-gray-400",
                    )}
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}

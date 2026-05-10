import { MobileSidebar } from "./mobile-sidebar";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export async function Navbar() {
  const user = await currentUser();
  const displayName =
    user?.firstName ??
    user?.emailAddresses[0]?.emailAddress ??
    "there";
  return (
    <header className="h-16 border-b border-gray-100 bg-white flex items-center justify-between px-4 md:px-6">
      {/* Left: Mobile menu + Page context */}
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div className="hidden md:block">
          <p className="text-sm text-gray-500">
            Welcome back,{" "}
            <span className="font-medium text-gray-900">
              {displayName} 👋
            </span>
          </p>
        </div>
      </div>

      {/* Right: User button (desktop only — already in sidebar) */}
      <div className="md:hidden">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    </header>
  );
}

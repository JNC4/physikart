"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Catenary", path: "/catenary" },
    { name: "Epicycles", path: "/epicycles" },
    { name: "Waves", path: "/waves" },
    { name: "Pendulum", path: "/pendulum" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-cyan-400">
            PhysikArt
          </Link>

          <div className="flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-cyan-400 ${
                  pathname === item.path
                    ? "text-cyan-400"
                    : "text-gray-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;

import { Link, useLocation } from "wouter";
import { Building2, Shield, Menu, X, Map } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Navbar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Начало", icon: Map },
    { href: "/enterprises", label: "Предприятия", icon: Building2 },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#2E9E8F] flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={`${BASE}/si-logo-white.gif`}
                  alt="Социална иновация"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-xl font-black tracking-widest uppercase text-foreground leading-tight">
                  Социална
                </span>
                <span className="text-xl font-black tracking-widest uppercase text-[#2E9E8F] leading-tight">
                  Карта
                </span>
                <span className="text-[9px] text-muted-foreground tracking-wide leading-tight mt-0.5">
                  Интерактивна карта · Североизточен район
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="ml-4 pl-4 border-l">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Админ
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Отвори меню"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent/10 hover:text-accent"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md text-muted-foreground hover:bg-accent/10 hover:text-accent"
            >
              <Shield className="h-5 w-5" />
              Админ
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

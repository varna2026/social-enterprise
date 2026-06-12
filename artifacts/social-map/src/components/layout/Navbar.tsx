import { Link, useLocation } from "wouter";
import { Building2, Shield, Menu, X, Map } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function MapPinDoodle() {
  return (
    <svg width="90" height="70" viewBox="0 0 90 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="10" fill="none" stroke="#5BB8B0" strokeWidth="1.5" />
      <line x1="20" y1="30" x2="20" y2="60" stroke="#5BB8B0" strokeWidth="1.5" />
      <polygon points="16,60 20,70 24,60" fill="#5BB8B0" />
      <path d="M 30 40 Q 50 20 70 35 Q 80 42 85 38" stroke="#5BB8B0" strokeWidth="1.5" strokeDasharray="4 3" fill="none" />
      <circle cx="85" cy="38" r="4" fill="none" stroke="#5BB8B0" strokeWidth="1.5" />
    </svg>
  );
}

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
        <div className="flex items-center justify-between py-3 gap-4">

          {/* Logo + Title + Description */}
          <Link href="/" className="flex items-center gap-4 min-w-0">
            {/* Animated GIF icon */}
            <div className="w-14 h-14 rounded-full bg-[#2E9E8F] flex items-center justify-center shrink-0">
              <img
                src={`${BASE}/si-logo-white.gif`}
                alt="Социална иновация"
                className="w-11 h-11 object-contain rounded-full"
              />
            </div>

            {/* СОЦИАЛНА КАРТА + description */}
            <div className="hidden sm:flex flex-col leading-none min-w-0">
              <div className="flex flex-col leading-none">
                <span className="text-2xl font-black tracking-widest uppercase text-foreground leading-tight">
                  Интерактивна
                </span>
                <span className="text-2xl font-black tracking-widest uppercase text-[#5BB8B0] leading-tight">
                  Карта
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 leading-tight max-w-[200px]">
                Открий социалните предприятия, техните каузи, продукти, услуги и социални иновации.
              </span>
            </div>
          </Link>

          {/* Divider + Info text + Map doodle */}
          <div className="hidden lg:flex items-center gap-3 border-l pl-5 ml-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-foreground leading-tight">
                Интерактивна карта
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                на социалните предприятия
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                в Североизточен район
              </span>
            </div>
            <MapPinDoodle />
          </div>

          {/* Nav links */}
          <div className="hidden md:flex md:items-center md:space-x-1 ml-auto shrink-0">
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
            <div className="ml-3 pl-3 border-l">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <Shield className="h-4 w-4" />
                  Админ
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden ml-auto">
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

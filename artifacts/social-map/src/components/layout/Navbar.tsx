import { Link, useLocation } from "wouter";
import { Building2, Shield, Menu, X, Map } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function SocialMapLogo({ size = 40 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;

  const pt = (deg: number) => {
    const rad = (deg - 90) * (Math.PI / 180);
    return `${(cx + r * Math.cos(rad)).toFixed(2)} ${(cy + r * Math.sin(rad)).toFixed(2)}`;
  };

  const seg = (a1: number, a2: number, color: string) =>
    `M ${cx} ${cy} L ${pt(a1)} A ${r} ${r} 0 0 1 ${pt(a2)} Z`;

  const d = size * 0.14;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      <path d={seg(0, 45, "")} fill="#4AADA2" />
      <path d={seg(45, 90, "")} fill="#C0C0C0" />
      <path d={seg(90, 135, "")} fill="#F07840" />
      <path d={seg(135, 180, "")} fill="#888888" />
      <path d={seg(180, 225, "")} fill="#4AADA2" />
      <path d={seg(225, 270, "")} fill="#C0C0C0" />
      <path d={seg(270, 315, "")} fill="#F5C030" />
      <path d={seg(315, 360, "")} fill="#888888" />
      <polygon
        points={`${cx},${cy - d} ${cx + d},${cy} ${cx},${cy + d} ${cx - d},${cy}`}
        fill="#F5C030"
      />
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
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <SocialMapLogo size={40} />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-lg font-black tracking-wide uppercase text-foreground leading-none">
                  Социална{" "}
                  <span className="text-[#4AADA2]">Карта</span>
                </span>
                <span className="text-[10px] text-muted-foreground leading-tight tracking-wide">
                  Интерактивна карта на социалните предприятия
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

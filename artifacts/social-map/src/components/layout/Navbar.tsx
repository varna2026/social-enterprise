import { Link, useLocation } from "wouter";
import { Building2, Shield, Menu, X, Map } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function SocialKartaLogo({ size = 48 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 2;
  const gap = 4;

  const arc = (startDeg: number, endDeg: number, color: string) => {
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const s = toRad(startDeg + gap / 2);
    const e = toRad(endDeg - gap / 2);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return (
      <path
        key={startDeg}
        d={`M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`}
        fill={color}
      />
    );
  };

  const d = size * 0.13;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg">
      {arc(0,   45,  "#5BB8B0")}
      {arc(45,  90,  "#C8C8C8")}
      {arc(90,  135, "#9E9E9E")}
      {arc(135, 180, "#F07840")}
      {arc(180, 225, "#9E9E9E")}
      {arc(225, 270, "#5BB8B0")}
      {arc(270, 315, "#C8C8C8")}
      {arc(315, 360, "#9E9E9E")}
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
              <SocialKartaLogo size={48} />
              <div className="hidden sm:flex flex-col leading-none">
                <span className="text-xl font-black tracking-widest uppercase text-foreground leading-tight">
                  Социална
                </span>
                <span className="text-xl font-black tracking-widest uppercase text-[#5BB8B0] leading-tight">
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

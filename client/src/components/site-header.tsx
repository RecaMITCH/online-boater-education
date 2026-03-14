import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Menu, X, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SiteHeader() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/states", label: "Find Your State" },
    { href: "/blog", label: "Blog" },
    { href: "/about", label: "About" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" data-testid="link-home-logo">
          <div className="flex items-center gap-2">
            <img src="/images/logo-web.png" alt="Online Boater Ed" className="h-24" />
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                size="sm"
                className="text-sm font-medium"
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">

          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated && (

                <Link href="/admin">

                  <Button variant="ghost" size="sm" data-testid="link-admin">

                    <Settings className="h-4 w-4 mr-1" />

                    Admin

                  </Button>

                </Link>

              )}
              {isAuthenticated && (

                <Avatar className="h-8 w-8">

                  <AvatarFallback className="text-xs">A</AvatarFallback>

                </Avatar>

              )}
              <a href="/api/logout">
                <Button variant="ghost" size="icon" data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                </Button>
              </a>
            </div>
          ) : null}

          <Button
            size="icon"
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <Link href="/admin">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="link-mobile-admin"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <a href="/api/logout">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    data-testid="button-mobile-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </Button>
                </a>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

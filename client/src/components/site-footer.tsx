import { Link } from "wouter";
import { Anchor, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactFormDialog } from "@/components/contact-form";

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Anchor className="h-6 w-6 text-primary" />
              <span className="font-serif text-lg font-bold">Online Boater Ed</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your trusted resource for online boater education courses across the United States.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground transition-colors" data-testid="link-footer-home">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/states" className="text-sm text-muted-foreground transition-colors" data-testid="link-footer-states">
                  Find Your State
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-muted-foreground transition-colors" data-testid="link-footer-blog">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="text-sm text-muted-foreground transition-colors" data-testid="link-footer-quiz">
                  Do I Need a License?
                </Link>
              </li>
              <li>
                <Link href="/right-of-way" className="text-sm text-muted-foreground transition-colors" data-testid="link-footer-game">
                  Play the Game
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground transition-colors" data-testid="link-footer-about">
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.nasbla.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors"
                  data-testid="link-footer-nasbla"
                >
                  NASBLA
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Contact</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Mail className="h-4 w-4" />
              <span data-testid="text-contact-email">info@onlineboatereducation.com</span>
            </div>
            <ContactFormDialog>
              <Button variant="outline" size="sm">Send us a message</Button>
            </ContactFormDialog>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center">
          <p className="text-xs text-muted-foreground" data-testid="text-copyright">
            &copy; {new Date().getFullYear()} Online Boater Education. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

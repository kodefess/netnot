import Link from "next/link";
import { Heart } from "lucide-react";

const footerLinks = [
  { label: "How it works", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-top">
        <a className="brand footer-brand" href="#">
          <span className="brand-icon">r</span> Receipt studio
        </a>
        <nav className="footer-links">
          {footerLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="footer-rule" />

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Receipt studio. All rights reserved.</p>
        <p className="footer-made">
          Made with <Heart size={12} /> for people who like their receipts
          pretty.
        </p>
      </div>
    </footer>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Main pages shown directly in navbar
const MAIN_PAGE_SLUGS = [
  "developer-docs",
  "loan-comparison",
  "services",
  "about-renewcred",
];

export default function PublicNav({ pages = [] }) {
  const pathname = usePathname();

  // Get main navigation pages
  const mainPages = MAIN_PAGE_SLUGS.map((slug) =>
    pages.find((page) => page.slug === slug),
  ).filter(Boolean);

  // All newly created pages go inside More
  const morePages = pages.filter(
    (page) => page.slug !== "home" && !MAIN_PAGE_SLUGS.includes(page.slug),
  );

  // Check if a More page is active
  const isMoreActive = morePages.some((page) => pathname === `/${page.slug}`);

  return (
    <nav className="public-nav">
      {/* Home */}
      <Link href="/" className={pathname === "/" ? "active" : ""}>
        Home
      </Link>

      {/* Main pages */}
      {mainPages.map((page) => {
        const href = `/${page.slug}`;

        return (
          <Link
            key={page._id}
            href={href}
            className={pathname === href ? "active" : ""}
          >
            {page.title}
          </Link>
        );
      })}

      {/* Newly created pages */}
      {morePages.length > 0 && (
        <div className={`more-menu ${isMoreActive ? "active" : ""}`}>
          <button type="button" className="more-button">
            More
            <span className="more-arrow">▾</span>
          </button>

          <div className="more-dropdown">
            {morePages.map((page) => {
              const href = `/${page.slug}`;

              return (
                <Link
                  key={page._id}
                  href={href}
                  className={pathname === href ? "active" : ""}
                >
                  {page.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

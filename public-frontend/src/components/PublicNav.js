"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PublicNav({ pages }) {
  const pathname = usePathname();

  return (
    <nav className="public-nav">
      <Link href="/" className={pathname === "/" ? "active" : ""}>
        Home
      </Link>

      {pages
        .filter((page) => page.slug !== "home")
        .map((page) => {
          const href = `/${page.slug}`;
          const isActive = pathname === href;

          return (
            <Link
              key={page._id}
              href={href}
              className={isActive ? "active" : ""}
            >
              {page.title}
            </Link>
          );
        })}
    </nav>
  );
}

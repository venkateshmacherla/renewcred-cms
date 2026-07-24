import Link from "next/link";

import { getPublishedPages } from "@/services/pageService";
import PublicNav from "./PublicNav";

import "./public-header.css";

export default async function PublicHeader() {
  let pages = [];

  try {
    const data = await getPublishedPages();
    pages = data?.pages || [];
  } catch (error) {
    console.error("Failed to load navigation:", error);
  }

  return (
    <header className="public-header">
      <div className="public-nav-container">
        <Link href="/" className="public-logo">
          RenewCred
        </Link>

        <PublicNav pages={pages} />
      </div>
    </header>
  );
}

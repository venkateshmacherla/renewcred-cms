"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { getPages } from "@/services/pageService";
import "./dashboard.css";

export default function DashboardPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPages = async () => {
      try {
        setLoading(true);

        const data = await getPages();

        setPages(data.pages || []);
      } catch (error) {
        console.log("Failed to load dashboard:", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadPages();
  }, []);
  const publishedPages = pages.filter(
    (page) => page.status === "published",
  ).length;

  const draftPages = pages.filter((page) => page.status === "draft").length;

  return (
    <AdminLayout>
      <div className="dashboard">
        <div className="dashboard-heading">
          <div>
            <h1>Dashboard</h1>
            <p>Manage and monitor your website content.</p>
          </div>

          <a href="/pages/new" className="create-page-button">
            + Create Page
          </a>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <p>Total Pages</p>
            <h2>{loading ? "-" : pages.length}</h2>
            <span>All CMS pages</span>
          </div>

          <div className="stat-card">
            <p>Published</p>
            <h2>{loading ? "-" : publishedPages}</h2>
            <span>Visible on website</span>
          </div>

          <div className="stat-card">
            <p>Drafts</p>
            <h2>{loading ? "-" : draftPages}</h2>
            <span>Not published yet</span>
          </div>
        </div>

        <div className="dashboard-section">
          <div>
            <h2>Content Management</h2>
            <p>
              Create, update and manage the pages displayed on the RenewCred
              website.
            </p>
          </div>

          <a href="/pages" className="manage-pages-button">
            Manage Pages
          </a>
        </div>
      </div>
    </AdminLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import AdminLayout from "@/components/layout/AdminLayout";
import { getPages, deletePage } from "@/services/pageService";
import toast from "react-hot-toast";

import "./pages.css";

export default function PagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPages();
      setPages(data.pages || []);
    } catch (error) {
      setError(error.message || "Failed to load pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (page) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${page.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(page._id);

      await deletePage(page._id);

      setPages((currentPages) =>
        currentPages.filter((currentPage) => currentPage._id !== page._id),
      );

      toast.success("Page deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete page");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString();
  };

  return (
    <AdminLayout>
      <div className="pages-container">
        <div className="pages-heading">
          <div>
            <h1>Pages</h1>
            <p>Create and manage your website content.</p>
          </div>

          <Link href="/pages/new" className="create-page-btn">
            + Create Page
          </Link>
        </div>

        <div className="pages-table-card">
          {loading && <div className="pages-message">Loading pages...</div>}

          {!loading && error && (
            <div className="pages-message error-message">
              <p>{error}</p>

              <button type="button" onClick={loadPages}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && pages.length === 0 && (
            <div className="pages-message">
              <h3>No pages found</h3>

              <p>Create your first page to get started.</p>

              <Link href="/pages/new">Create Page</Link>
            </div>
          )}

          {!loading && !error && pages.length > 0 && (
            <div className="table-wrapper">
              <table className="pages-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {pages.map((page) => (
                    <tr key={page._id}>
                      <td className="page-title">{page.title}</td>

                      <td>/{page.slug}</td>

                      <td>
                        <span
                          className={`status-badge ${
                            page.status === "published" ? "published" : "draft"
                          }`}
                        >
                          {page.status}
                        </span>
                      </td>

                      <td>{formatDate(page.updatedAt)}</td>

                      <td>
                        <div className="page-actions">
                          <Link
                            href={`/pages/${page._id}/edit`}
                            className="edit-button"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => handleDelete(page)}
                            disabled={deletingId === page._id}
                          >
                            {deletingId === page._id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

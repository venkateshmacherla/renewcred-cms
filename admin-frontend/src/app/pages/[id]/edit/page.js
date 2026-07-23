"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import AdminLayout from "@/components/layout/AdminLayout";
import { getPageById, updatePage } from "@/services/pageService";

import "./edit-page.css";

export default function EditPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft",
    sections: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing page
  useEffect(() => {
    const loadPage = async () => {
      try {
        const data = await getPageById(id);
        const page = data.page;

        setFormData({
          title: page?.title || "",
          slug: page?.slug || "",
          description: page?.description || "",
          status: page?.status || "draft",
          sections: Array.isArray(page?.sections) ? page.sections : [],
        });
      } catch (error) {
        toast.error(error.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id]);

  // Handle basic fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Add new section
  const addSection = () => {
    const newSection = {
      type: "heading",
      content: {
        text: "",
      },
    };

    setFormData((current) => ({
      ...current,
      sections: [...current.sections, newSection],
    }));
  };

  // Update heading / paragraph / section type
  const updateSection = (sectionIndex, field, value) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        if (field === "type") {
          return {
            ...section,
            type: value,
            content: value === "list" ? { items: [""] } : { text: "" },
          };
        }

        return {
          ...section,
          content: {
            ...section.content,
            text: value,
          },
        };
      });

      return {
        ...current,
        sections: updatedSections,
      };
    });
  };

  // Remove complete section
  const removeSection = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  // Add item to list section
  const addListItem = (sectionIndex) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          content: {
            ...section.content,
            items: [...(section.content?.items || []), ""],
          },
        };
      });

      return {
        ...current,
        sections: updatedSections,
      };
    });
  };

  // Update list item
  const updateListItem = (sectionIndex, itemIndex, value) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const updatedItems = (section.content?.items || []).map(
          (item, index) => (index === itemIndex ? value : item),
        );

        return {
          ...section,
          content: {
            ...section.content,
            items: updatedItems,
          },
        };
      });

      return {
        ...current,
        sections: updatedSections,
      };
    });
  };

  // Remove list item
  const removeListItem = (sectionIndex, itemIndex) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          content: {
            ...section.content,
            items: (section.content?.items || []).filter(
              (_, index) => index !== itemIndex,
            ),
          },
        };
      });

      return {
        ...current,
        sections: updatedSections,
      };
    });
  };

  // Save updated page
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Page title is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Page slug is required");
      return;
    }

    // Validate dynamic sections
    const hasEmptySection = formData.sections.some((section) => {
      if (section.type === "list") {
        const items = section.content?.items || [];

        return items.length === 0 || items.some((item) => !item.trim());
      }

      return !section.content?.text?.trim();
    });

    if (hasEmptySection) {
      toast.error("Please complete all content sections");
      return;
    }

    try {
      setSaving(true);

      await updatePage(id, formData);

      toast.success("Page updated successfully");

      router.push("/pages");
    } catch (error) {
      toast.error(error.message || "Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="new-page-container">
          <p>Loading page...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="new-page-container">
        {/* Page Header */}

        <div className="new-page-heading">
          <div>
            <h1>Edit Page</h1>
            <p>Update your website page information and content.</p>
          </div>

          <Link href="/pages" className="back-button">
            Back to Pages
          </Link>
        </div>

        <form className="page-form" onSubmit={handleSubmit}>
          {/* Page Title */}

          <div className="form-group">
            <label htmlFor="title">
              Page Title <span>*</span>
            </label>

            <input
              id="title"
              name="title"
              type="text"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Slug */}

          <div className="form-group">
            <label htmlFor="slug">
              Slug <span>*</span>
            </label>

            <div className="slug-input">
              <span>/</span>

              <input
                id="slug"
                name="slug"
                type="text"
                value={formData.slug}
                onChange={handleChange}
              />
            </div>

            <small>Changing this will change the public page URL.</small>
          </div>

          {/* Description */}

          <div className="form-group">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          {/* Status */}

          <div className="form-group">
            <label htmlFor="status">Status</label>

            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="draft">Draft</option>

              <option value="published">Published</option>
            </select>
          </div>

          {/* Dynamic Page Content */}

          <div className="sections-area">
            <div className="sections-header">
              <div>
                <h2>Page Content</h2>

                <p>Edit the content sections displayed on this page.</p>
              </div>

              <button
                type="button"
                className="add-section-button"
                onClick={addSection}
              >
                + Add Section
              </button>
            </div>

            {/* Empty State */}

            {formData.sections.length === 0 ? (
              <div className="empty-sections">
                <p>No content sections added yet.</p>

                <span>Click &quot;+ Add Section&quot; to add content.</span>
              </div>
            ) : (
              /* Existing Sections */

              <div className="sections-list">
                {formData.sections.map((section, sectionIndex) => (
                  <div
                    className="section-card"
                    key={section._id || sectionIndex}
                  >
                    {/* Section Header */}

                    <div className="section-top">
                      <strong>Section {sectionIndex + 1}</strong>

                      <button
                        type="button"
                        className="remove-section-button"
                        onClick={() => removeSection(sectionIndex)}
                      >
                        Remove
                      </button>
                    </div>

                    {/* Section Type */}

                    <div className="form-group">
                      <label>Section Type</label>

                      <select
                        value={section.type}
                        onChange={(event) =>
                          updateSection(
                            sectionIndex,
                            "type",
                            event.target.value,
                          )
                        }
                      >
                        <option value="heading">Heading</option>

                        <option value="paragraph">Paragraph</option>

                        <option value="list">List</option>
                      </select>
                    </div>

                    {/* Heading / Paragraph */}

                    {section.type !== "list" && (
                      <div className="form-group">
                        <label>
                          {section.type === "heading"
                            ? "Heading Text"
                            : "Paragraph Text"}
                        </label>

                        <textarea
                          rows={section.type === "paragraph" ? 5 : 2}
                          placeholder={
                            section.type === "heading"
                              ? "Enter heading"
                              : "Enter paragraph"
                          }
                          value={section.content?.text || ""}
                          onChange={(event) =>
                            updateSection(
                              sectionIndex,
                              "text",
                              event.target.value,
                            )
                          }
                        />
                      </div>
                    )}

                    {/* List Editor */}

                    {section.type === "list" && (
                      <div className="list-editor">
                        <div className="list-editor-header">
                          <label>List Items</label>

                          <button
                            type="button"
                            className="add-item-button"
                            onClick={() => addListItem(sectionIndex)}
                          >
                            + Add Item
                          </button>
                        </div>

                        {(section.content?.items || []).length === 0 ? (
                          <div className="no-items">
                            <p>No list items added yet.</p>

                            <button
                              type="button"
                              className="add-item-button"
                              onClick={() => addListItem(sectionIndex)}
                            >
                              + Add First Item
                            </button>
                          </div>
                        ) : (
                          section.content.items.map((item, itemIndex) => (
                            <div className="list-item-row" key={itemIndex}>
                              <span className="item-number">
                                {itemIndex + 1}.
                              </span>

                              <input
                                type="text"
                                placeholder={`List item ${itemIndex + 1}`}
                                value={item}
                                onChange={(event) =>
                                  updateListItem(
                                    sectionIndex,
                                    itemIndex,
                                    event.target.value,
                                  )
                                }
                              />

                              <button
                                type="button"
                                className="remove-item-button"
                                aria-label={`Remove list item ${itemIndex + 1}`}
                                onClick={() =>
                                  removeListItem(sectionIndex, itemIndex)
                                }
                              >
                                ×
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}

          <div className="form-actions">
            <Link href="/pages" className="cancel-button">
              Cancel
            </Link>

            <button type="submit" className="save-button" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

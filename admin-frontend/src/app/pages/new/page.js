"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import AdminLayout from "@/components/layout/AdminLayout";
import { createPage } from "@/services/pageService";

import "./new-page.css";

export default function NewPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    status: "draft",
    sections: [],
  });

  const [saving, setSaving] = useState(false);

  // Generate slug from page title
  const createSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Handle normal form fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => {
      if (name === "title") {
        return {
          ...current,
          title: value,
          slug: createSlug(value),
        };
      }

      return {
        ...current,
        [name]: value,
      };
    });
  };

  // Add new content section
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

  // Update section type or text
  const updateSection = (index, field, value) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, sectionIndex) => {
        if (sectionIndex !== index) {
          return section;
        }

        if (field === "type") {
          return {
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
  const removeSection = (index) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.filter(
        (_, sectionIndex) => sectionIndex !== index,
      ),
    }));
  };

  // Add new item inside a list section
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
            items: [...(section.content.items || []), ""],
          },
        };
      });

      return {
        ...current,
        sections: updatedSections,
      };
    });
  };

  // Update individual list item
  const updateListItem = (sectionIndex, itemIndex, value) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const updatedItems = (section.content.items || []).map((item, index) =>
          index === itemIndex ? value : item,
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

  // Remove individual list item
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
            items: (section.content.items || []).filter(
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

  // Create page
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

    // Validate all dynamic sections
    const hasEmptySection = formData.sections.some((section) => {
      if (section.type === "list") {
        const items = section.content.items || [];

        return items.length === 0 || items.some((item) => !item.trim());
      }

      return !section.content.text?.trim();
    });

    if (hasEmptySection) {
      toast.error("Please complete all content sections");
      return;
    }

    try {
      setSaving(true);

      await createPage(formData);

      toast.success("Page created successfully");

      router.push("/pages");
    } catch (error) {
      toast.error(error.message || "Failed to create page");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="new-page-container">
        <div className="new-page-heading">
          <div>
            <h1>Create Page</h1>
            <p>Add a new page to your website.</p>
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
              placeholder="Example: About Us"
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
                placeholder="about-us"
                value={formData.slug}
                onChange={handleChange}
              />
            </div>

            <small>Used in the page URL. You can edit it manually.</small>
          </div>

          {/* Description */}

          <div className="form-group">
            <label htmlFor="description">Description</label>

            <textarea
              id="description"
              name="description"
              rows="4"
              placeholder="Short description about this page"
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

          {/* Dynamic Content */}

          <div className="sections-area">
            <div className="sections-header">
              <div>
                <h2>Page Content</h2>

                <p>Add content sections that will appear on this page.</p>
              </div>

              <button
                type="button"
                className="add-section-button"
                onClick={addSection}
              >
                + Add Section
              </button>
            </div>

            {formData.sections.length === 0 ? (
              <div className="empty-sections">
                <p>No content sections added yet.</p>

                <span>Click &quot;+ Add Section&quot; to add content.</span>
              </div>
            ) : (
              <div className="sections-list">
                {formData.sections.map((section, index) => (
                  <div className="section-card" key={index}>
                    {/* Section Header */}

                    <div className="section-top">
                      <strong>Section {index + 1}</strong>

                      <button
                        type="button"
                        className="remove-section-button"
                        onClick={() => removeSection(index)}
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
                          updateSection(index, "type", event.target.value)
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
                          value={section.content.text || ""}
                          onChange={(event) =>
                            updateSection(index, "text", event.target.value)
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
                            onClick={() => addListItem(index)}
                          >
                            + Add Item
                          </button>
                        </div>

                        {!section.content.items ||
                        section.content.items.length === 0 ? (
                          <div className="no-items">
                            <p>No list items added yet.</p>

                            <button
                              type="button"
                              className="add-item-button"
                              onClick={() => addListItem(index)}
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
                                    index,
                                    itemIndex,
                                    event.target.value,
                                  )
                                }
                              />

                              <button
                                type="button"
                                className="remove-item-button"
                                aria-label={`Remove list item ${itemIndex + 1}`}
                                onClick={() => removeListItem(index, itemIndex)}
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
              {saving ? "Creating..." : "Create Page"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

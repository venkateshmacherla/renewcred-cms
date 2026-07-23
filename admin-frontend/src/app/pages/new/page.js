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

  // Generate slug automatically from title
  const createSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  // Handle main form fields
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

  // Add a new content section
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

  // Change section type or update heading/paragraph text
  const updateSection = (sectionIndex, field, value) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        if (field === "type") {
          let content;

          if (value === "list") {
            content = {
              items: [""],
            };
          } else if (value === "table") {
            content = {
              headers: ["Column 1", "Column 2"],
              rows: [["", ""]],
            };
          } else {
            content = {
              text: "",
            };
          }

          return {
            type: value,
            content,
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

  // Remove a complete content section
  const removeSection = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  // Add an item to a list section
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

  // Update a list item
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

  // Remove a list item
  const removeListItem = (sectionIndex, itemIndex) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const currentItems = section.content.items || [];

        // Keep at least one input for a list section
        if (currentItems.length <= 1) {
          return section;
        }

        return {
          ...section,
          content: {
            ...section.content,
            items: currentItems.filter((_, index) => index !== itemIndex),
          },
        };
      });

      return {
        ...current,
        sections: updatedSections,
      };
    });
  };

  // Update table header
  const updateTableHeader = (sectionIndex, headerIndex, value) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const headers = [...(section.content?.headers || [])];

        headers[headerIndex] = value;

        return {
          ...section,
          content: {
            ...section.content,
            headers,
          },
        };
      }),
    }));
  };

  // Update table cell
  const updateTableCell = (sectionIndex, rowIndex, columnIndex, value) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const rows = (section.content?.rows || []).map((row) => [...row]);

        rows[rowIndex][columnIndex] = value;

        return {
          ...section,
          content: {
            ...section.content,
            rows,
          },
        };
      }),
    }));
  };

  // Add table column
  const addTableColumn = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const headers = section.content?.headers || [];
        const rows = section.content?.rows || [];

        return {
          ...section,
          content: {
            ...section.content,

            headers: [...headers, `Column ${headers.length + 1}`],

            rows: rows.map((row) => [...row, ""]),
          },
        };
      }),
    }));
  };

  // Remove table column
  const removeTableColumn = (sectionIndex, columnIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const headers = section.content?.headers || [];

        if (headers.length <= 1) {
          return section;
        }

        return {
          ...section,
          content: {
            ...section.content,

            headers: headers.filter((_, index) => index !== columnIndex),

            rows: (section.content?.rows || []).map((row) =>
              row.filter((_, index) => index !== columnIndex),
            ),
          },
        };
      }),
    }));
  };

  // Add table row
  const addTableRow = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const columnCount = section.content?.headers?.length || 1;

        return {
          ...section,
          content: {
            ...section.content,

            rows: [
              ...(section.content?.rows || []),
              Array(columnCount).fill(""),
            ],
          },
        };
      }),
    }));
  };

  // Remove table row
  const removeTableRow = (sectionIndex, rowIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const rows = section.content?.rows || [];

        if (rows.length <= 1) {
          return section;
        }

        return {
          ...section,
          content: {
            ...section.content,

            rows: rows.filter((_, index) => index !== rowIndex),
          },
        };
      }),
    }));
  };

  // Submit and create page
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

      if (section.type === "table") {
        const headers = section.content?.headers || [];
        const rows = section.content?.rows || [];

        if (headers.length === 0 || headers.some((header) => !header.trim())) {
          return true;
        }

        if (
          rows.length === 0 ||
          rows.some(
            (row) =>
              row.length !== headers.length || row.some((cell) => !cell.trim()),
          )
        ) {
          return true;
        }

        return false;
      }

      return !section.content?.text?.trim();
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

          {/* Dynamic Content Sections */}
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
                {formData.sections.map((section, sectionIndex) => (
                  <div className="section-card" key={sectionIndex}>
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
                        <option value="table">Table</option>
                      </select>
                    </div>

                    {/* Heading / Paragraph Editor */}
                    {section.type !== "list" && section.type !== "table" && (
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
                    {/* Table Editor */}
                    {section.type === "table" && (
                      <div className="form-group table-editor">
                        <div className="table-editor-heading">
                          <label>Table Content</label>

                          <div className="table-actions">
                            <button
                              type="button"
                              className="add-list-item-button"
                              onClick={() => addTableColumn(sectionIndex)}
                            >
                              + Add Column
                            </button>

                            <button
                              type="button"
                              className="add-list-item-button"
                              onClick={() => addTableRow(sectionIndex)}
                            >
                              + Add Row
                            </button>
                          </div>
                        </div>

                        <div className="table-editor-scroll">
                          <table className="cms-table-editor">
                            <thead>
                              <tr>
                                {(section.content?.headers || []).map(
                                  (header, headerIndex) => (
                                    <th key={headerIndex}>
                                      <div className="table-header-input">
                                        <input
                                          type="text"
                                          value={header}
                                          placeholder={`Column ${headerIndex + 1}`}
                                          onChange={(event) =>
                                            updateTableHeader(
                                              sectionIndex,
                                              headerIndex,
                                              event.target.value,
                                            )
                                          }
                                        />

                                        <button
                                          type="button"
                                          className="table-remove-button"
                                          disabled={
                                            section.content?.headers?.length <=
                                            1
                                          }
                                          onClick={() =>
                                            removeTableColumn(
                                              sectionIndex,
                                              headerIndex,
                                            )
                                          }
                                        >
                                          ×
                                        </button>
                                      </div>
                                    </th>
                                  ),
                                )}

                                <th className="table-action-column">Action</th>
                              </tr>
                            </thead>

                            <tbody>
                              {(section.content?.rows || []).map(
                                (row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, columnIndex) => (
                                      <td key={columnIndex}>
                                        <input
                                          type="text"
                                          value={cell}
                                          placeholder="Enter value"
                                          onChange={(event) =>
                                            updateTableCell(
                                              sectionIndex,
                                              rowIndex,
                                              columnIndex,
                                              event.target.value,
                                            )
                                          }
                                        />
                                      </td>
                                    ))}

                                    <td>
                                      <button
                                        type="button"
                                        className="remove-list-item-button"
                                        disabled={
                                          section.content?.rows?.length <= 1
                                        }
                                        onClick={() =>
                                          removeTableRow(sectionIndex, rowIndex)
                                        }
                                      >
                                        Remove
                                      </button>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* List Editor */}
                    {section.type === "list" && (
                      <div className="form-group">
                        <div className="list-heading-row">
                          <label>List Items</label>

                          <button
                            type="button"
                            className="add-list-item-button"
                            onClick={() => addListItem(sectionIndex)}
                          >
                            + Add Item
                          </button>
                        </div>

                        <div className="list-items">
                          {(section.content?.items || []).map(
                            (item, itemIndex) => (
                              <div className="list-item-row" key={itemIndex}>
                                <span className="list-item-number">
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
                                  className="remove-list-item-button"
                                  onClick={() =>
                                    removeListItem(sectionIndex, itemIndex)
                                  }
                                  disabled={section.content?.items?.length <= 1}
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}
                        </div>
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

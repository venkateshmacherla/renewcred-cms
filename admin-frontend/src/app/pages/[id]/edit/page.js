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

  // =====================================================
  // NORMALIZE SECTION DATA FROM BACKEND
  // =====================================================

  const normalizeSection = (section) => {
    if (section.type === "list") {
      return {
        ...section,
        content: {
          items: Array.isArray(section.content?.items)
            ? section.content.items
            : [],
        },
      };
    }

    if (section.type === "table") {
      const headers = Array.isArray(section.content?.headers)
        ? section.content.headers
        : [];

      const rows = Array.isArray(section.content?.rows)
        ? section.content.rows
        : [];

      return {
        ...section,
        content: {
          headers,
          rows: rows.map((row) => {
            const safeRow = Array.isArray(row) ? row : [];

            return headers.map((_, columnIndex) => safeRow[columnIndex] ?? "");
          }),
        },
      };
    }

    return {
      ...section,
      content: {
        text: section.content?.text || "",
      },
    };
  };

  // =====================================================
  // LOAD EXISTING PAGE
  // =====================================================

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

          sections: Array.isArray(page?.sections)
            ? page.sections.map(normalizeSection)
            : [],
        });
      } catch (error) {
        toast.error(error.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [id]);

  // =====================================================
  // BASIC PAGE FIELDS
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =====================================================
  // CREATE CONTENT BASED ON SECTION TYPE
  // =====================================================

  const getDefaultContent = (type) => {
    switch (type) {
      case "list":
        return {
          items: [""],
        };

      case "table":
        return {
          headers: ["Column 1", "Column 2"],
          rows: [["", ""]],
        };

      case "heading":
      case "paragraph":
      default:
        return {
          text: "",
        };
    }
  };

  // =====================================================
  // ADD SECTION
  // =====================================================

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

  // =====================================================
  // CHANGE SECTION TYPE
  // =====================================================

  const changeSectionType = (sectionIndex, newType) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,
          type: newType,
          content: getDefaultContent(newType),
        };
      }),
    }));
  };

  // =====================================================
  // UPDATE TEXT SECTION
  // =====================================================

  const updateSectionText = (sectionIndex, value) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        return {
          ...section,

          content: {
            ...section.content,
            text: value,
          },
        };
      }),
    }));
  };

  // =====================================================
  // REMOVE SECTION
  // =====================================================

  const removeSection = (sectionIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  // =====================================================
  // LIST FUNCTIONS
  // =====================================================

  const addListItem = (sectionIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const items = Array.isArray(section.content?.items)
          ? section.content.items
          : [];

        return {
          ...section,

          content: {
            ...section.content,
            items: [...items, ""],
          },
        };
      }),
    }));
  };

  const updateListItem = (sectionIndex, itemIndex, value) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const items = Array.isArray(section.content?.items)
          ? section.content.items
          : [];

        return {
          ...section,

          content: {
            ...section.content,

            items: items.map((item, index) =>
              index === itemIndex ? value : item,
            ),
          },
        };
      }),
    }));
  };

  const removeListItem = (sectionIndex, itemIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const items = Array.isArray(section.content?.items)
          ? section.content.items
          : [];

        return {
          ...section,

          content: {
            ...section.content,

            items: items.filter((_, index) => index !== itemIndex),
          },
        };
      }),
    }));
  };

  // =====================================================
  // TABLE - ADD COLUMN
  // =====================================================

  const addTableColumn = (sectionIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const headers = Array.isArray(section.content?.headers)
          ? section.content.headers
          : [];

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

        return {
          ...section,

          content: {
            ...section.content,

            headers: [...headers, `Column ${headers.length + 1}`],

            rows: rows.map((row) => [...(Array.isArray(row) ? row : []), ""]),
          },
        };
      }),
    }));
  };

  // =====================================================
  // TABLE - REMOVE COLUMN
  // =====================================================

  const removeTableColumn = (sectionIndex, columnIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const headers = Array.isArray(section.content?.headers)
          ? section.content.headers
          : [];

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

        if (headers.length <= 1) {
          toast.error("Table must have at least one column");
          return section;
        }

        return {
          ...section,

          content: {
            ...section.content,

            headers: headers.filter((_, index) => index !== columnIndex),

            rows: rows.map((row) =>
              Array.isArray(row)
                ? row.filter((_, index) => index !== columnIndex)
                : [],
            ),
          },
        };
      }),
    }));
  };

  // =====================================================
  // TABLE - UPDATE HEADER
  // =====================================================

  const updateTableHeader = (sectionIndex, columnIndex, value) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const headers = Array.isArray(section.content?.headers)
          ? section.content.headers
          : [];

        return {
          ...section,

          content: {
            ...section.content,

            headers: headers.map((header, index) =>
              index === columnIndex ? value : header,
            ),
          },
        };
      }),
    }));
  };

  // =====================================================
  // TABLE - ADD ROW
  // =====================================================

  const addTableRow = (sectionIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const headers = Array.isArray(section.content?.headers)
          ? section.content.headers
          : [];

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

        const newRow = headers.map(() => "");

        return {
          ...section,

          content: {
            ...section.content,
            rows: [...rows, newRow],
          },
        };
      }),
    }));
  };

  // =====================================================
  // TABLE - REMOVE ROW
  // =====================================================

  const removeTableRow = (sectionIndex, rowIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

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

  // =====================================================
  // TABLE - UPDATE CELL
  // =====================================================

  const updateTableCell = (sectionIndex, rowIndex, columnIndex, value) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

        const updatedRows = rows.map((row, currentRowIndex) => {
          if (currentRowIndex !== rowIndex) {
            return row;
          }

          return row.map((cell, currentColumnIndex) =>
            currentColumnIndex === columnIndex ? value : cell,
          );
        });

        return {
          ...section,

          content: {
            ...section.content,
            rows: updatedRows,
          },
        };
      }),
    }));
  };

  // =====================================================
  // VALIDATE SECTIONS
  // =====================================================

  const validateSections = () => {
    for (const section of formData.sections) {
      if (section.type === "heading" || section.type === "paragraph") {
        if (!section.content?.text?.trim()) {
          toast.error(`Please enter content for the ${section.type} section`);

          return false;
        }
      }

      if (section.type === "list") {
        const items = Array.isArray(section.content?.items)
          ? section.content.items
          : [];

        if (items.length === 0) {
          toast.error("Please add at least one list item");
          return false;
        }

        if (items.some((item) => !String(item).trim())) {
          toast.error("Please complete all list items");
          return false;
        }
      }

      if (section.type === "table") {
        const headers = Array.isArray(section.content?.headers)
          ? section.content.headers
          : [];

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

        if (headers.length === 0) {
          toast.error("Table must have at least one column");
          return false;
        }

        if (headers.some((header) => !String(header).trim())) {
          toast.error("Please complete all table headers");
          return false;
        }

        if (rows.length === 0) {
          toast.error("Please add at least one table row");
          return false;
        }

        const hasEmptyCell = rows.some((row) =>
          row.some((cell) => !String(cell).trim()),
        );

        if (hasEmptyCell) {
          toast.error("Please complete all table cells");
          return false;
        }
      }
    }

    return true;
  };

  // =====================================================
  // SAVE UPDATED PAGE
  // =====================================================

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

    if (!validateSections()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,

        title: formData.title.trim(),

        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),

        description: formData.description.trim(),

        sections: formData.sections.map((section) => {
          // Do not manually send MongoDB section ID
          const { _id, ...sectionWithoutId } = section;

          return sectionWithoutId;
        }),
      };

      await updatePage(id, payload);

      toast.success("Page updated successfully");

      router.push("/pages");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to update page");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <AdminLayout>
        <div className="new-page-container">
          <p>Loading page...</p>
        </div>
      </AdminLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <AdminLayout>
      <div className="new-page-container">
        {/* PAGE HEADER */}

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
          {/* PAGE TITLE */}

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

          {/* SLUG */}

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

          {/* DESCRIPTION */}

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

          {/* STATUS */}

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

          {/* PAGE CONTENT */}

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

            {/* EMPTY STATE */}

            {formData.sections.length === 0 ? (
              <div className="empty-sections">
                <p>No content sections added yet.</p>

                <span>Click &quot;+ Add Section&quot; to add content.</span>
              </div>
            ) : (
              <div className="sections-list">
                {formData.sections.map((section, sectionIndex) => (
                  <div
                    className="section-card"
                    key={section._id || `section-${sectionIndex}`}
                  >
                    {/* SECTION HEADER */}

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

                    {/* SECTION TYPE */}

                    <div className="form-group">
                      <label>Section Type</label>

                      <select
                        value={section.type}
                        onChange={(event) =>
                          changeSectionType(sectionIndex, event.target.value)
                        }
                      >
                        <option value="heading">Heading</option>

                        <option value="paragraph">Paragraph</option>

                        <option value="list">List</option>

                        <option value="table">Table</option>
                      </select>
                    </div>

                    {/* HEADING */}

                    {section.type === "heading" && (
                      <div className="form-group">
                        <label>Heading Text</label>

                        <textarea
                          rows="2"
                          placeholder="Enter heading"
                          value={section.content?.text || ""}
                          onChange={(event) =>
                            updateSectionText(sectionIndex, event.target.value)
                          }
                        />
                      </div>
                    )}

                    {/* PARAGRAPH */}

                    {section.type === "paragraph" && (
                      <div className="form-group">
                        <label>Paragraph Text</label>

                        <textarea
                          rows="5"
                          placeholder="Enter paragraph"
                          value={section.content?.text || ""}
                          onChange={(event) =>
                            updateSectionText(sectionIndex, event.target.value)
                          }
                        />
                      </div>
                    )}

                    {/* LIST */}

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

                        <div className="list-items">
                          {(section.content?.items || []).map(
                            (item, itemIndex) => (
                              <div
                                className="list-item-row"
                                key={`item-${sectionIndex}-${itemIndex}`}
                              >
                                <span className="list-item-number">
                                  {itemIndex + 1}.
                                </span>

                                <input
                                  type="text"
                                  value={item}
                                  placeholder={`List item ${itemIndex + 1}`}
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
                                >
                                  Remove
                                </button>
                              </div>
                            ),
                          )}

                          {(section.content?.items || []).length === 0 && (
                            <div className="empty-list-items">
                              <p>No list items added yet.</p>

                              <button
                                type="button"
                                className="add-first-item-button"
                                onClick={() => addListItem(sectionIndex)}
                              >
                                + Add First Item
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TABLE */}

                    {section.type === "table" && (
                      <div className="table-editor">
                        <div className="table-editor-header">
                          <label>Table Content</label>

                          <div className="table-actions">
                            <button
                              type="button"
                              className="add-item-button"
                              onClick={() => addTableColumn(sectionIndex)}
                            >
                              + Add Column
                            </button>

                            <button
                              type="button"
                              className="add-item-button"
                              onClick={() => addTableRow(sectionIndex)}
                            >
                              + Add Row
                            </button>
                          </div>
                        </div>

                        <div className="table-scroll">
                          <div className="table-edit-grid">
                            {/* TABLE HEADERS */}

                            <div className="table-header-row">
                              {(section.content?.headers || []).map(
                                (header, columnIndex) => (
                                  <div
                                    className="table-header-cell"
                                    key={`header-${sectionIndex}-${columnIndex}`}
                                  >
                                    <input
                                      type="text"
                                      value={header}
                                      placeholder={`Column ${columnIndex + 1}`}
                                      onChange={(event) =>
                                        updateTableHeader(
                                          sectionIndex,
                                          columnIndex,
                                          event.target.value,
                                        )
                                      }
                                    />

                                    <button
                                      type="button"
                                      className="remove-table-column-button"
                                      title="Remove column"
                                      onClick={() =>
                                        removeTableColumn(
                                          sectionIndex,
                                          columnIndex,
                                        )
                                      }
                                    >
                                      ×
                                    </button>
                                  </div>
                                ),
                              )}

                              <div className="table-action-heading">Action</div>
                            </div>

                            {/* TABLE ROWS */}

                            {(section.content?.rows || []).map(
                              (row, rowIndex) => (
                                <div
                                  className="table-data-row"
                                  key={`row-${sectionIndex}-${rowIndex}`}
                                >
                                  {(section.content?.headers || []).map(
                                    (_, columnIndex) => (
                                      <input
                                        key={`cell-${sectionIndex}-${rowIndex}-${columnIndex}`}
                                        type="text"
                                        placeholder="Enter value"
                                        value={row?.[columnIndex] ?? ""}
                                        onChange={(event) =>
                                          updateTableCell(
                                            sectionIndex,
                                            rowIndex,
                                            columnIndex,
                                            event.target.value,
                                          )
                                        }
                                      />
                                    ),
                                  )}

                                  <button
                                    type="button"
                                    className="remove-table-row-button"
                                    onClick={() =>
                                      removeTableRow(sectionIndex, rowIndex)
                                    }
                                  >
                                    Remove
                                  </button>
                                </div>
                              ),
                            )}

                            {(section.content?.rows || []).length === 0 && (
                              <div className="empty-table">
                                <p>No rows added yet.</p>

                                <button
                                  type="button"
                                  className="add-first-item-button"
                                  onClick={() => addTableRow(sectionIndex)}
                                >
                                  + Add First Row
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FORM ACTIONS */}

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

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import AdminLayout from "@/components/layout/AdminLayout";
import { createPage } from "@/services/pageService";

import "./new-page.css";

/* CUSTOM SELECT */

function CustomSelect({ value, options, onChange, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="custom-select" ref={selectRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span>{selectedOption?.label}</span>

        <span className="custom-select-arrow" aria-hidden="true">
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="custom-select-menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={value === option.value}
              className={`custom-select-option ${
                value === option.value ? "selected" : ""
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* OPTIONS */

const STATUS_OPTIONS = [
  {
    value: "draft",
    label: "Draft",
  },
  {
    value: "published",
    label: "Published",
  },
];

const SECTION_TYPE_OPTIONS = [
  { value: "heading", label: "Heading" },
  { value: "paragraph", label: "Paragraph" },
  { value: "list", label: "List" },
  { value: "nestedList", label: "Nested List" },
  { value: "table", label: "Table" },
  { value: "equation", label: "Equation" },
  { value: "code", label: "Code Block" },
];

/* CREATE PAGE */

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

  /* CREATE SLUG */

  const createSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  /*  MAIN FORM CHANGE */

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

  /* ADD SECTION */

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

  /* UPDATE SECTION */

  const updateSection = (sectionIndex, field, value) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        /*  When section type changes,
            initialize the correct content structure.
          */

        if (field === "type") {
          let content;

          if (value === "list") {
            content = {
              items: [""],
            };
          } else if (value === "nestedList") {
            content = {
              items: [
                {
                  text: "",
                  children: [""],
                },
              ],
            };
          } else if (value === "table") {
            content = {
              headers: ["Column 1", "Column 2"],
              rows: [["", ""]],
            };
          } else if (value === "equation") {
            content = {
              text: "",
            };
          } else if (value === "code") {
            content = {
              text: "",
              language: "javascript",
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

        /*
            Heading / Paragraph text
          */

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

  /* UPDATE SECTION CONTENT FIELD */

  const updateSectionContent = (sectionIndex, field, value) => {
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
            [field]: value,
          },
        };
      }),
    }));
  };

  /* REMOVE SECTION*/

  const removeSection = (sectionIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  /* MOVE SECTION */

  const moveSection = (sectionIndex, direction) => {
    setFormData((current) => {
      const newIndex = sectionIndex + direction;

      if (newIndex < 0 || newIndex >= current.sections.length) {
        return current;
      }

      const sections = [...current.sections];

      [sections[sectionIndex], sections[newIndex]] = [
        sections[newIndex],
        sections[sectionIndex],
      ];

      return {
        ...current,
        sections,
      };
    });
  };

  /*  LIST FUNCTIONS */

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

  const removeListItem = (sectionIndex, itemIndex) => {
    setFormData((current) => {
      const updatedSections = current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const currentItems = section.content?.items || [];

        /*
            Keep at least one list item.
          */

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

  /* NESTED LIST FUNCTIONS */

  // Add a new parent item
  const addNestedListItem = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        return {
          ...section,
          content: {
            ...section.content,
            items: [
              ...(section.content?.items || []),
              {
                text: "",
                children: [""],
              },
            ],
          },
        };
      }),
    }));
  };

  // Update parent item text
  const updateNestedListItem = (sectionIndex, itemIndex, value) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        const items = [...(section.content?.items || [])];

        items[itemIndex] = {
          ...items[itemIndex],
          text: value,
        };

        return {
          ...section,
          content: {
            ...section.content,
            items,
          },
        };
      }),
    }));
  };

  // Remove a parent item
  const removeNestedListItem = (sectionIndex, itemIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        const items = section.content?.items || [];

        // Keep at least one parent item
        if (items.length <= 1) return section;

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

  // Add a child item under a parent
  const addNestedChild = (sectionIndex, itemIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        const items = [...(section.content?.items || [])];

        items[itemIndex] = {
          ...items[itemIndex],
          children: [...(items[itemIndex]?.children || []), ""],
        };

        return {
          ...section,
          content: {
            ...section.content,
            items,
          },
        };
      }),
    }));
  };

  // Update a child item
  const updateNestedChild = (sectionIndex, itemIndex, childIndex, value) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        const items = [...(section.content?.items || [])];
        const children = [...(items[itemIndex]?.children || [])];

        children[childIndex] = value;

        items[itemIndex] = {
          ...items[itemIndex],
          children,
        };

        return {
          ...section,
          content: {
            ...section.content,
            items,
          },
        };
      }),
    }));
  };

  // Remove a child item
  const removeNestedChild = (sectionIndex, itemIndex, childIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        const items = [...(section.content?.items || [])];
        const children = items[itemIndex]?.children || [];

        // Keep at least one child
        if (children.length <= 1) return section;

        items[itemIndex] = {
          ...items[itemIndex],
          children: children.filter((_, index) => index !== childIndex),
        };

        return {
          ...section,
          content: {
            ...section.content,
            items,
          },
        };
      }),
    }));
  };

  /* TABLE - UPDATE HEADER */

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

  /* TABLE - UPDATE CELL */

  const updateTableCell = (sectionIndex, rowIndex, columnIndex, value) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const rows = (section.content?.rows || []).map((row) => [...row]);

        if (!rows[rowIndex]) {
          return section;
        }

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

  /* TABLE - ADD COLUMN*/

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

  /* TABLE - REMOVE COLUMN*/

  const removeTableColumn = (sectionIndex, columnIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const headers = section.content?.headers || [];

        /*
            Keep at least one column.
          */

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

  /* TABLE - ADD ROW */

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

  /* TABLE - REMOVE ROW */

  const removeTableRow = (sectionIndex, rowIndex) => {
    setFormData((current) => ({
      ...current,

      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) {
          return section;
        }

        const rows = section.content?.rows || [];

        /*
            Keep at least one row.
          */

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

  /*  SUBMIT */

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

    /*
      Validate all dynamic content sections.
    */

    const hasEmptySection = formData.sections.some((section) => {
      /*
          List validation
        */

      if (section.type === "list") {
        const items = section.content?.items || [];

        return (
          items.length === 0 || items.some((item) => !String(item || "").trim())
        );
      }

      /*
          Table validation
        */

      if (section.type === "table") {
        const headers = section.content?.headers || [];

        const rows = section.content?.rows || [];

        if (
          headers.length === 0 ||
          headers.some((header) => !String(header || "").trim())
        ) {
          return true;
        }

        if (
          rows.length === 0 ||
          rows.some(
            (row) =>
              row.length !== headers.length ||
              row.some((cell) => !String(cell || "").trim()),
          )
        ) {
          return true;
        }

        return false;
      }

      /*
          Heading / Paragraph validation
        */

      return !String(section.content?.text || "").trim();
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
      toast.error(error?.message || "Failed to create page");
    } finally {
      setSaving(false);
    }
  };

  /*  UI */

  return (
    <AdminLayout>
      <div className="new-page-container">
        {/* PAGE HEADING */}

        <div className="new-page-heading">
          <div>
            <h1>Create Page</h1>

            <p>Add a new page to your website.</p>
          </div>

          <Link href="/pages" className="back-button">
            Back to Pages
          </Link>
        </div>

        {/*  FORM */}

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

          {/* STATUS CUSTOM DROPDOWN */}

          <div className="form-group">
            <label>Status</label>

            <CustomSelect
              value={formData.status}
              options={STATUS_OPTIONS}
              ariaLabel="Select page status"
              onChange={(value) =>
                setFormData((current) => ({
                  ...current,

                  status: value,
                }))
              }
            />
          </div>

          {/*  DYNAMIC CONTENT SECTIONS */}

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

            {/* Empty State */}

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

                      <div className="section-actions">
                        <button
                          type="button"
                          className="move-section-button"
                          onClick={() => moveSection(sectionIndex, -1)}
                          disabled={sectionIndex === 0}
                        >
                          ↑ Up
                        </button>

                        <button
                          type="button"
                          className="move-section-button"
                          onClick={() => moveSection(sectionIndex, 1)}
                          disabled={
                            sectionIndex === formData.sections.length - 1
                          }
                        >
                          ↓ Down
                        </button>

                        <button
                          type="button"
                          className="remove-section-button"
                          onClick={() => removeSection(sectionIndex)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* SECTION TYPE CUSTOM SELECT */}

                    <div className="form-group">
                      <label>Section Type</label>

                      <CustomSelect
                        value={section.type}
                        options={SECTION_TYPE_OPTIONS}
                        ariaLabel={`Select type for section ${
                          sectionIndex + 1
                        }`}
                        onChange={(value) =>
                          updateSection(sectionIndex, "type", value)
                        }
                      />
                    </div>

                    {/* HEADING / PARAGRAPH*/}

                    {/* HEADING / PARAGRAPH */}

                    {(section.type === "heading" ||
                      section.type === "paragraph") && (
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

                    {/* EQUATION EDITOR */}

                    {section.type === "equation" && (
                      <div className="form-group">
                        <label>Equation</label>

                        <textarea
                          rows="3"
                          placeholder="Example: E = mc^2"
                          value={section.content?.text || ""}
                          onChange={(event) =>
                            updateSectionContent(
                              sectionIndex,
                              "text",
                              event.target.value,
                            )
                          }
                        />

                        <small>
                          Enter the mathematical equation to display on the
                          page.
                        </small>
                      </div>
                    )}

                    {/* CODE BLOCK EDITOR */}

                    {section.type === "code" && (
                      <>
                        <div className="form-group">
                          <label>Language</label>

                          <input
                            type="text"
                            placeholder="Example: javascript"
                            value={section.content?.language || ""}
                            onChange={(event) =>
                              updateSectionContent(
                                sectionIndex,
                                "language",
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="form-group">
                          <label>Code</label>

                          <textarea
                            rows="8"
                            className="code-editor-input"
                            placeholder={`Example:\nconsole.log("Hello World");`}
                            value={section.content?.text || ""}
                            onChange={(event) =>
                              updateSectionContent(
                                sectionIndex,
                                "text",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                      </>
                    )}

                    {/*  LIST EDITOR */}

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

                    {/* NESTED LIST */}
                    {section.type === "nestedList" && (
                      <div className="form-group">
                        <label>Nested List Items</label>

                        <div className="nested-list-editor">
                          {(section.content?.items || []).map(
                            (item, itemIndex) => (
                              <div className="nested-list-item" key={itemIndex}>
                                {/* Parent item */}
                                <div className="list-item-row">
                                  <input
                                    type="text"
                                    placeholder={`Parent item ${itemIndex + 1}`}
                                    value={item.text || ""}
                                    onChange={(event) =>
                                      updateNestedListItem(
                                        sectionIndex,
                                        itemIndex,
                                        event.target.value,
                                      )
                                    }
                                  />

                                  <button
                                    type="button"
                                    className="small-remove-button"
                                    onClick={() =>
                                      removeNestedListItem(
                                        sectionIndex,
                                        itemIndex,
                                      )
                                    }
                                    disabled={
                                      (section.content?.items || []).length <= 1
                                    }
                                  >
                                    Remove
                                  </button>
                                </div>

                                {/* Child items */}
                                <div className="nested-children">
                                  {(item.children || []).map(
                                    (child, childIndex) => (
                                      <div
                                        className="list-item-row nested-child-row"
                                        key={childIndex}
                                      >
                                        <input
                                          type="text"
                                          placeholder={`Child item ${childIndex + 1}`}
                                          value={child}
                                          onChange={(event) =>
                                            updateNestedChild(
                                              sectionIndex,
                                              itemIndex,
                                              childIndex,
                                              event.target.value,
                                            )
                                          }
                                        />

                                        <button
                                          type="button"
                                          className="small-remove-button"
                                          onClick={() =>
                                            removeNestedChild(
                                              sectionIndex,
                                              itemIndex,
                                              childIndex,
                                            )
                                          }
                                          disabled={
                                            (item.children || []).length <= 1
                                          }
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ),
                                  )}

                                  <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() =>
                                      addNestedChild(sectionIndex, itemIndex)
                                    }
                                  >
                                    + Add Child
                                  </button>
                                </div>
                              </div>
                            ),
                          )}

                          <button
                            type="button"
                            className="secondary-button"
                            onClick={() => addNestedListItem(sectionIndex)}
                          >
                            + Add Parent Item
                          </button>
                        </div>
                      </div>
                    )}

                    {/* TABLE EDITOR */}

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
                                          placeholder={`Column ${
                                            headerIndex + 1
                                          }`}
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
                                          aria-label={`Remove column ${
                                            headerIndex + 1
                                          }`}
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

                                    <td className="table-row-action">
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
                  </div>
                ))}
              </div>
            )}
          </div>

          {/*   FORM ACTIONS */}

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

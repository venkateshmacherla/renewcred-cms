"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import AdminLayout from "@/components/layout/AdminLayout";
import { getPageById, updatePage } from "@/services/pageService";

import "./edit-page.css";

// Dropdown options
const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
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

// Custom select
function CustomSelect({
  value,
  options,
  onChange,
  ariaLabel = "Select option",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption =
    options.find((option) => option.value === value) || options[0];

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelect = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <div className="custom-select" ref={dropdownRef}>
      <button
        type="button"
        className={`custom-select-trigger ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <span>{selectedOption?.label}</span>
        <span className="custom-select-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="custom-select-menu">
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`custom-select-option ${
                option.value === value ? "selected" : ""
              }`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  // Normalize section data
  const normalizeSection = (section) => {
    if (section.type === "list") {
      return {
        ...section,
        content: {
          items:
            Array.isArray(section.content?.items) &&
            section.content.items.length > 0
              ? section.content.items
              : [""],
        },
      };
    }

    if (section.type === "nestedList") {
      const items = Array.isArray(section.content?.items)
        ? section.content.items
        : [];

      return {
        ...section,
        content: {
          items:
            items.length > 0
              ? items.map((item) => ({
                  text: item?.text || "",
                  children:
                    Array.isArray(item?.children) && item.children.length > 0
                      ? item.children
                      : [""],
                }))
              : [
                  {
                    text: "",
                    children: [""],
                  },
                ],
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

    if (section.type === "code") {
      return {
        ...section,
        content: {
          text: section.content?.text || "",
          language: section.content?.language || "javascript",
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

  // Load page
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

  // Update basic fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Default section content
  const getDefaultContent = (type) => {
    switch (type) {
      case "list":
        return {
          items: [""],
        };

      case "nestedList":
        return {
          items: [
            {
              text: "",
              children: [""],
            },
          ],
        };

      case "table":
        return {
          headers: ["Column 1", "Column 2"],
          rows: [["", ""]],
        };

      case "code":
        return {
          text: "",
          language: "javascript",
        };

      default:
        return {
          text: "",
        };
    }
  };

  // Add section
  const addSection = () => {
    setFormData((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          type: "heading",
          content: {
            text: "",
          },
        },
      ],
    }));
  };

  // Change section type
  const changeSectionType = (sectionIndex, newType) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        return {
          ...section,
          type: newType,
          content: getDefaultContent(newType),
        };
      }),
    }));
  };

  // Update text
  const updateSectionText = (sectionIndex, value) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

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

  // Update content field
  const updateSectionContent = (sectionIndex, field, value) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

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

  // Remove section
  const removeSection = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.filter((_, index) => index !== sectionIndex),
    }));
  };

  // Move section
  const moveSection = (sectionIndex, direction) => {
    setFormData((current) => {
      const newIndex = sectionIndex + direction;

      if (newIndex < 0 || newIndex >= current.sections.length) {
        return current;
      }

      const updatedSections = [...current.sections];

      [updatedSections[sectionIndex], updatedSections[newIndex]] = [
        updatedSections[newIndex],
        updatedSections[sectionIndex],
      ];

      return {
        ...current,
        sections: updatedSections,
      };
    });
  };

  // List functions
  const addListItem = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

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
        if (index !== sectionIndex) return section;

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
    const section = formData.sections[sectionIndex];
    const items = Array.isArray(section?.content?.items)
      ? section.content.items
      : [];

    if (items.length <= 1) {
      toast.error("List must have at least one item");
      return;
    }

    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        return {
          ...section,
          content: {
            ...section.content,
            items: section.content.items.filter(
              (_, index) => index !== itemIndex,
            ),
          },
        };
      }),
    }));
  };

  // Nested list functions
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

  const removeNestedListItem = (sectionIndex, itemIndex) => {
    const section = formData.sections[sectionIndex];
    const items = section?.content?.items || [];

    if (items.length <= 1) {
      toast.error("Nested list must have at least one parent item");
      return;
    }

    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        return {
          ...section,
          content: {
            ...section.content,
            items: (section.content?.items || []).filter(
              (_, index) => index !== itemIndex,
            ),
          },
        };
      }),
    }));
  };

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

  const removeNestedChild = (sectionIndex, itemIndex, childIndex) => {
    const section = formData.sections[sectionIndex];
    const children = section?.content?.items?.[itemIndex]?.children || [];

    if (children.length <= 1) {
      toast.error("Parent item must have at least one child");
      return;
    }

    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        const items = [...(section.content?.items || [])];
        const currentChildren = items[itemIndex]?.children || [];

        items[itemIndex] = {
          ...items[itemIndex],
          children: currentChildren.filter((_, index) => index !== childIndex),
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

  // Table functions
  const addTableColumn = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

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

  const removeTableColumn = (sectionIndex, columnIndex) => {
    const section = formData.sections[sectionIndex];

    const headers = Array.isArray(section?.content?.headers)
      ? section.content.headers
      : [];

    if (headers.length <= 1) {
      toast.error("Table must have at least one column");
      return;
    }

    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        const currentHeaders = Array.isArray(section.content?.headers)
          ? section.content.headers
          : [];

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

        return {
          ...section,
          content: {
            ...section.content,
            headers: currentHeaders.filter((_, index) => index !== columnIndex),
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

  const updateTableHeader = (sectionIndex, columnIndex, value) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

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

  const addTableRow = (sectionIndex) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

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
            rows: [...rows, headers.map(() => "")],
          },
        };
      }),
    }));
  };

  const removeTableRow = (sectionIndex, rowIndex) => {
    const section = formData.sections[sectionIndex];

    const rows = Array.isArray(section?.content?.rows)
      ? section.content.rows
      : [];

    if (rows.length <= 1) {
      toast.error("Table must have at least one row");
      return;
    }

    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        return {
          ...section,
          content: {
            ...section.content,
            rows: section.content.rows.filter((_, index) => index !== rowIndex),
          },
        };
      }),
    }));
  };

  const updateTableCell = (sectionIndex, rowIndex, columnIndex, value) => {
    setFormData((current) => ({
      ...current,
      sections: current.sections.map((section, index) => {
        if (index !== sectionIndex) return section;

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

        const updatedRows = rows.map((row, currentRowIndex) => {
          if (currentRowIndex !== rowIndex) return row;

          const safeRow = Array.isArray(row) ? row : [];

          return safeRow.map((cell, currentColumnIndex) =>
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

  // Validate sections
  const validateSections = () => {
    for (const section of formData.sections) {
      if (section.type === "heading" || section.type === "paragraph") {
        if (!section.content?.text?.trim()) {
          toast.error(`Please enter content for the ${section.type} section`);
          return false;
        }
      }

      if (section.type === "equation") {
        if (!section.content?.text?.trim()) {
          toast.error("Please enter an equation");
          return false;
        }
      }

      if (section.type === "code") {
        if (!section.content?.language?.trim()) {
          toast.error("Please enter a language for the code block");
          return false;
        }

        if (!section.content?.text?.trim()) {
          toast.error("Please enter code");
          return false;
        }
      }

      if (section.type === "list") {
        const items = Array.isArray(section.content?.items)
          ? section.content.items
          : [];

        if (items.length === 0 || items.some((item) => !String(item).trim())) {
          toast.error("Please complete all list items");
          return false;
        }
      }

      if (section.type === "nestedList") {
        const items = Array.isArray(section.content?.items)
          ? section.content.items
          : [];

        if (items.length === 0) {
          toast.error("Please add at least one nested list item");
          return false;
        }

        for (const item of items) {
          if (!item?.text?.trim()) {
            toast.error("Please complete all nested list parent items");
            return false;
          }

          const children = Array.isArray(item?.children) ? item.children : [];

          if (
            children.length === 0 ||
            children.some((child) => !String(child).trim())
          ) {
            toast.error("Please complete all nested list child items");
            return false;
          }
        }
      }

      if (section.type === "table") {
        const headers = Array.isArray(section.content?.headers)
          ? section.content.headers
          : [];

        const rows = Array.isArray(section.content?.rows)
          ? section.content.rows
          : [];

        if (
          headers.length === 0 ||
          headers.some((header) => !String(header).trim())
        ) {
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

  // Save page
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

    if (!validateSections()) return;

    try {
      setSaving(true);

      const payload = {
        ...formData,
        title: formData.title.trim(),
        slug: formData.slug.trim().toLowerCase().replace(/\s+/g, "-"),
        description: formData.description.trim(),

        sections: formData.sections.map((section) => {
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

                    <div className="form-group">
                      <label>Section Type</label>

                      <CustomSelect
                        value={section.type}
                        options={SECTION_TYPE_OPTIONS}
                        ariaLabel={`Select type for section ${
                          sectionIndex + 1
                        }`}
                        onChange={(value) =>
                          changeSectionType(sectionIndex, value)
                        }
                      />
                    </div>

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
                        </div>
                      </div>
                    )}

                    {section.type === "nestedList" && (
                      <div className="nested-list-editor">
                        <div className="list-editor-header">
                          <label>Nested List Items</label>

                          <button
                            type="button"
                            className="add-item-button"
                            onClick={() => addNestedListItem(sectionIndex)}
                          >
                            + Add Parent Item
                          </button>
                        </div>

                        <div className="nested-list-items">
                          {(section.content?.items || []).map(
                            (item, itemIndex) => (
                              <div
                                className="nested-list-item"
                                key={`nested-${sectionIndex}-${itemIndex}`}
                              >
                                <div className="nested-parent-row">
                                  <input
                                    type="text"
                                    placeholder={`Parent item ${itemIndex + 1}`}
                                    value={item?.text || ""}
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
                                    className="remove-list-item-button"
                                    onClick={() =>
                                      removeNestedListItem(
                                        sectionIndex,
                                        itemIndex,
                                      )
                                    }
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="nested-children">
                                  {(item?.children || []).map(
                                    (child, childIndex) => (
                                      <div
                                        className="nested-child-row"
                                        key={`child-${sectionIndex}-${itemIndex}-${childIndex}`}
                                      >
                                        <span>↳</span>

                                        <input
                                          type="text"
                                          placeholder={`Child item ${
                                            childIndex + 1
                                          }`}
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
                                          className="remove-list-item-button"
                                          onClick={() =>
                                            removeNestedChild(
                                              sectionIndex,
                                              itemIndex,
                                              childIndex,
                                            )
                                          }
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    ),
                                  )}

                                  <button
                                    type="button"
                                    className="add-item-button"
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
                        </div>
                      </div>
                    )}

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
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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

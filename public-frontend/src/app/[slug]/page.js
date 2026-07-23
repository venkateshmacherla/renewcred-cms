import { notFound } from "next/navigation";

import { getPublishedPageBySlug } from "@/services/pageService";

import "../home.css";

function renderSection(section, index) {
  if (!section) {
    return null;
  }

  if (section.type === "heading") {
    return (
      <section className="content-section" key={section._id || index}>
        <h2>{section.content?.text}</h2>
      </section>
    );
  }

  if (section.type === "paragraph") {
    return (
      <section className="content-section" key={section._id || index}>
        <p>{section.content?.text}</p>
      </section>
    );
  }

  if (section.type === "list") {
    const items = section.content?.items || [];

    return (
      <section className="content-section" key={section._id || index}>
        <ul>
          {items.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ul>
      </section>
    );
  }

  if (section.type === "table") {
    const headers = section.content?.headers || [];
    const rows = section.content?.rows || [];

    return (
      <section className="content-section" key={section._id || index}>
        <div className="table-wrapper">
          <table className="content-table">
            {headers.length > 0 && (
              <thead>
                <tr>
                  {headers.map((header, headerIndex) => (
                    <th key={headerIndex}>{header}</th>
                  ))}
                </tr>
              </thead>
            )}

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  return null;
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;

  let data;

  try {
    data = await getPublishedPageBySlug(slug);
  } catch {
    notFound();
  }

  const page = data?.page;

  if (!page) {
    notFound();
  }

  return (
    <main className="public-page">
      <div className="page-container">
        <header className="page-header">
          <h1>{page.title}</h1>

          {page.description && <p>{page.description}</p>}
        </header>

        <div className="page-content">
          {(page.sections || []).map((section, index) =>
            renderSection(section, index),
          )}
        </div>
      </div>
    </main>
  );
}

import { getPublishedPageBySlug } from "@/services/pageService";
import "./home.css";

export default async function Home() {
  let page;

  try {
    const data = await getPublishedPageBySlug("home");
    page = data.page;
  } catch (error) {
    console.error("Failed to load home page:", error);

    return (
      <main className="public-page">
        <div className="page-container">
          <h1>Page unavailable</h1>
          <p>Unable to load the page content. Please try again later.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="public-page">
      <div className="page-container">
        <header className="page-header">
          <h1>{page.title}</h1>

          {page.description && <p>{page.description}</p>}
        </header>

        <div className="page-content">
          {page.sections?.map((section, index) => {
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
              return (
                <section className="content-section" key={section._id || index}>
                  <ul>
                    {section.content?.items?.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                </section>
              );
            }

            return null;
          })}
        </div>
      </div>
    </main>
  );
}

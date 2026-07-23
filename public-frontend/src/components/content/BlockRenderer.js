export default function BlockRenderer({ section }) {
  if (!section) {
    return null;
  }

  const { type, content } = section;

  switch (type) {
    case "heading":
      return (
        <section className="content-section">
          <h2>{content?.text || ""}</h2>
        </section>
      );

    case "paragraph":
      return (
        <section className="content-section">
          <p>{content?.text || ""}</p>
        </section>
      );

    case "list":
      return (
        <section className="content-section">
          <ul>
            {(content?.items || []).map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      );

    default:
      return null;
  }
}

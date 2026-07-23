const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const getPublishedPages = async () => {
  const response = await fetch(`${API_URL}/public/pages`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load pages");
  }

  return data;
};

export const getPublishedPageBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/public/pages/${slug}`, {
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load page");
  }

  return data;
};

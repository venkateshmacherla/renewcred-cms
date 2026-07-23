const API_URL = "http://localhost:5000/api/v1";

export const getPages = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/pages`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch pages");
  }

  return data;
};

// Creating a new page POST request
export const createPage = async (pageData) => {
  const token = localStorage.getItem("token");

  const response = await fetch("http://localhost:5000/api/v1/pages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pageData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create page");
  }

  return data;
};

// Fetching a single page by ID GET request
export const getPageById = async (id) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:5000/api/v1/pages/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch page");
  }

  return data;
};

// Updating a page PUT request
export const updatePage = async (id, pageData) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:5000/api/v1/pages/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pageData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update page");
  }

  return data;
};

// Deleting a page DELETE request
export const deletePage = async (pageId) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`http://localhost:5000/api/v1/pages/${pageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete page");
  }

  return data;
};

const Page = require("../models/Page");

const createPage = async (req, res) => {
  try {
    const { title, slug, description, sections, status } = req.body;

    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        message: "Title and slug are required",
      });
    }

    const existingPage = await Page.findOne({ slug });

    if (existingPage) {
      return res.status(400).json({
        success: false,
        message: "A page with this slug already exists",
      });
    }

    const page = await Page.create({
      title,
      slug,
      description,
      sections,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Page created successfully",
      page,
    });
  } catch (error) {
    console.error("Create page error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the page",
    });
  }
};

// Get all pages for the admin dashboard
const getAllPages = async (req, res) => {
  try {
    const pages = await Page.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pages.length,
      pages,
    });
  } catch (error) {
    console.error("Get pages error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching pages",
    });
  }
};

// Get one page by ID
const getPageById = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    return res.status(200).json({
      success: true,
      page,
    });
  } catch (error) {
    console.error("Get page error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching the page",
    });
  }
};

// Update a page
const updatePage = async (req, res) => {
  try {
    const { title, slug, description, sections, status } = req.body;

    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    // Make sure another page is not already using this slug
    if (slug && slug !== page.slug) {
      const existingPage = await Page.findOne({ slug });

      if (existingPage) {
        return res.status(400).json({
          success: false,
          message: "A page with this slug already exists",
        });
      }
    }

    page.title = title ?? page.title;
    page.slug = slug ?? page.slug;
    page.description = description ?? page.description;
    page.sections = sections ?? page.sections;
    page.status = status ?? page.status;

    const updatedPage = await page.save();

    return res.status(200).json({
      success: true,
      message: "Page updated successfully",
      page: updatedPage,
    });
  } catch (error) {
    console.error("Update page error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the page",
    });
  }
};

// Delete a page
const deletePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found",
      });
    }

    await page.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Page deleted successfully",
    });
  } catch (error) {
    console.error("Delete page error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the page",
    });
  }
};

module.exports = {
  createPage,
  getAllPages,
  getPageById,
  updatePage,
  deletePage,
};

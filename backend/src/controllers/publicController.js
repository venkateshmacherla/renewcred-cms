const Page = require("../models/Page");

// Get all published pages
const getPublishedPages = async (req, res) => {
  try {
    const pages = await Page.find({
      status: "published",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: pages.length,
      pages,
    });
  } catch (error) {
    console.error("Get published pages error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching content",
    });
  }
};

// Get one published page using its slug
const getPublishedPageBySlug = async (req, res) => {
  try {
    const page = await Page.findOne({
      slug: req.params.slug,
      status: "published",
    });

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
    console.error("Get published page error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching content",
    });
  }
};

module.exports = {
  getPublishedPages,
  getPublishedPageBySlug,
};

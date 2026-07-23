const express = require("express");

const {
  createPage,
  getAllPages,
  getPageById,
  updatePage,
  deletePage,
} = require("../controllers/pageController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createPage);
router.get("/", protect, getAllPages);

router.get("/:id", protect, getPageById);
router.put("/:id", protect, updatePage);
router.delete("/:id", protect, deletePage);

module.exports = router;

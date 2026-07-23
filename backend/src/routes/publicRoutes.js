const express = require("express");

const {
  getPublishedPages,
  getPublishedPageBySlug,
} = require("../controllers/publicController");

const router = express.Router();

router.get("/pages", getPublishedPages);
router.get("/pages/:slug", getPublishedPageBySlug);

module.exports = router;

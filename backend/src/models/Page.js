const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "heading",
        "paragraph",
        "list",
        "nestedList",
        "table",
        "equation",
        "code",
      ],
    },

    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  {
    _id: true,
  },
);

const pageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    sections: {
      type: [sectionSchema],
      default: [],
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Page", pageSchema);

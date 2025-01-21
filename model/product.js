import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      set: (value) => parseFloat(value.toFixed(2)),
    },
    quantity: {
      type: Number,
      required: true,
    },
    size: {
      type: [String],
    },
    type: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
    },
    team: {
      type: String,
    },
    images: {
      type: [String], // Array of strings to store image URLs or file paths
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;

const Product = require("../models/Product.model");
const asyncErrorHandler = require("../middlewares/asyncErrorHandler");
const cloudinary = require("cloudinary");

const addProduct = asyncErrorHandler(async (req, res, next) => {
  console.log("Body received:", req.body);
  console.log("Files received:", req.files);

  try {
    const sanitizedBody = {};

    for (const key in req.body) {
      sanitizedBody[key.trim()] = req.body[key];
    }

    const { name, description, price, cuttedPrice, category, stock } =
      sanitizedBody;

    if (
      !name ||
      !description ||
      !price ||
      !cuttedPrice ||
      !category ||
      !stock
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    if (!req.files || !req.files["images"]?.length) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const productImages = [];

    for (const imageFile of req.files["images"]) {
      const imageResult = await cloudinary.v2.uploader.upload(imageFile.path, {
        folder: "products",
      });

      productImages.push({
        public_id: imageResult.public_id,
        url: imageResult.secure_url,
      });
    }

    const parsedSpecifications = sanitizedBody.specifications
      ? JSON.parse(sanitizedBody.specifications).map((spec) => ({
          title: spec.title,
          description: spec.description,
        }))
      : [];

    const product = await Product.create({
      name,
      description,
      specifications: parsedSpecifications,
      price,
      cuttedPrice,
      category,
      stock,
      images: productImages,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while adding the product.",
      error: error.message,
    });
  }
});

const updateProduct = asyncErrorHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const sanitizedBody = {};

    for (const key in req.body) {
      sanitizedBody[key.trim()] = req.body[key];
    }

    const fieldsToUpdate = [
      "name",
      "description",
      "price",
      "cuttedPrice",
      "category",
      "stock",
    ];

    fieldsToUpdate.forEach((field) => {
      if (sanitizedBody[field]) {
        product[field] = sanitizedBody[field];
      }
    });

    if (sanitizedBody.specifications) {
      product.specifications = JSON.parse(sanitizedBody.specifications).map(
        (spec) => ({
          title: spec.title,
          description: spec.description,
        })
      );
    }

    if (req.files && req.files["images"]?.length > 0) {
      for (const imageFile of req.files["images"]) {
        const imageResult = await cloudinary.v2.uploader.upload(
          imageFile.path,
          {
            folder: "products",
          }
        );

        product.images.push({
          public_id: imageResult.public_id,
          url: imageResult.secure_url,
        });
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the product.",
      error: error.message,
    });
  }
});

const getProducts = asyncErrorHandler(async (req, res, next) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    console.error(error);
  }
});
module.exports = {
  addProduct,
  getProducts,
  updateProduct
};

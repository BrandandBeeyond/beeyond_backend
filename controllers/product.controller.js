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
        message: "image is required",
      });
    }

    const productImages = [];

    for (const imageFile of req.files["images"]) {
      const imageResult = await cloudinary.v2.uploader.upload(imageFile.path, {
        folder: "products",
      });
    }

    productImages.push({
      public_id: imageResult.public_id,
      url: imageResult.secure_url,
    });

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
      user: req.user.id,
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

module.exports = {
  addProduct,
};

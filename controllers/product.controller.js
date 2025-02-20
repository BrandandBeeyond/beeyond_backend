const Product = require('../models/Product.model');
const asyncErrorHandler = require('../middlewares/asyncErrorHandler');

const addProduct = asyncErrorHandler(async (req, res, next) => {
    console.log("Body received:", req.body);
    console.log("Files received:", req.files);
  
    try {
      // Sanitize the request body keys
      const sanitizedBody = {};
      for (const key in req.body) {
        sanitizedBody[key.trim()] = req.body[key];
      }
  
      // Extract required fields
      const { name, description, price, cuttedPrice, category, stock } = sanitizedBody;
  
      // Check for required fields
      if (!name || !description || !price || !cuttedPrice || !category || !stock) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be provided",
        });
      }
  
      // Check if product images are provided
      if (!req.files || !req.files["images"]?.length) {
        return res.status(400).json({
          success: false,
          message: "At least one product image is required",
        });
      }
  
      // Upload images to Cloudinary
      const productImages = await Promise.all(
        req.files["images"].map(async (imageFile) => {
          const result = await cloudinary.v2.uploader.upload(imageFile.path, {
            folder: "products",
          });
          return { public_id: result.public_id, url: result.secure_url };
        })
      );
  
      // Parse JSON fields for specifications
      const parsedSpecifications = sanitizedBody.specifications
        ? JSON.parse(sanitizedBody.specifications).map((spec) => ({
            title: spec.title,
            description: spec.description,
          }))
        : [];
  
      // Create new product entry
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
    addProduct
  }
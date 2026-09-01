const logger = require("../../logger");
const Product = require("../../models/admin/product_catalog");
const xlsx = require("xlsx");


exports.uploadCatalog = async (req, res) => {
  try {
    const filePath = req.file.path;

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log("data",data);
    
    // data is array of objects
    await Product.insertMany(data);

    res.json({
      success: true,
      message: "Catalog uploaded successfully",
      inserted: data.length,
    });
  } catch (err) {
    logger.log("Error in uploadCatalog",err);
    res.status(500).json({ message:"Error in uploadCatalog", error: err.message });
  }
};

exports.getCatalog = async (req, res) => {
  try {
    const catalog = await Product.aggregate([
      {
        $sort: {
          product_name: 1,
          category: 1,
        },
      },
      {
        $group: {
          _id: "$category",
          products: {
            $push: {
              _id: "$_id",
              product_name: "$product_name",
              price: "$price",
              size: "$size",
              type: "$type",
              stock: "$stock",
              category: "$category",
              sub_category: "$sub_category",
              gender: "$gender",
              description: "$description",
              image_1: "$image_1",
              image_2: "$image_2",
              is_trending: "$is_trending",
              is_best_seller: "$is_best_seller",
              createdAt: "$createdAt",
              updatedAt: "$updatedAt",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: "$_id",
          products: 1,
        },
      },
      {
        $sort: {
          category: 1,
        },
      },
    ]);

    return res.status(200).json({
      message: "Catalog fetched successfully",
      data: catalog,
    });

  } catch (err) {
    logger.error("Error in getCatalog", err);

    return res.status(500).json({
      message: "Error in getCatalog",
      error: err.message,
    });
  }
};

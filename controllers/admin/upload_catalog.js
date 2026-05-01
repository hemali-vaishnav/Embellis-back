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
const logger = require("../../logger");
const user_signup = require("../../models/user_signup");

exports.getAllUser = async (req, res, next) => {
    try {
        const getAllUser = await user_signup.find();
        
        if(!getAllUser){
            logger.error("Error fetching all user successfully");
            return res.status(400).json({
                message: "Error fetching all user successfully",
            });
        }

        return res.status(200).json({
            message: "All user get successfully",
            data: getAllUser
        })
    } catch (error) {
        logger.error("Error in getAllUser");
        res.status(500).json({
            message: "Error in getAllUser",
            error: error.message
        });
    }
}
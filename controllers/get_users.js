const logger = require("../logger");
const user_signup = require("../models/user_signup");

exports.getUserProfile = async (req, res, next) => {
    try {
        const getUser = await user_signup.findOne({ _id: req.user.id });
        
        if(!getUser){
            logger.info("Error fetching user successfully");
            return res.status(400).json({
                message: "Error fetching user successfully",
            });
        }

        return res.status(200).json({
            message: "User get successfully",
            data: getUser
        })
    } catch (error) {
        logger.error("Error in getUserProfile");
        res.status(500).json({
            message: "Error in getUserProfile",
            error: error.message
        });
    }
}
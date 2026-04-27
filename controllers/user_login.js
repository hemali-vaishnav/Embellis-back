const user_signup = require("../models/user_signup");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const logger = require("../logger");
require('dotenv').config();


exports.userLogin = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if(!email || !password ){
            logger.error("All fields are required");
            return res.status(400).json({message: "All fields are required"});
        }

        const user = await user_signup.findOne({email});
        if(!user){
            logger.error("Invalid user credentials.");
            return res.status(400).json({message: "Invalid user credentials."});
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            logger.error("Invalid password credentials.");
            return res.status(400).json({message: "Invalid password credentials."});
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        logger.info("User login successfully");
        res.status(201).json({
            message: "User login successfully",
            token,
            user: {
                id: user._id,
                username: user.name,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        logger.error("Error in userLogin",error);
        res.status(500).json({
            message: "Error in userLogin",
            error: error.message
        });
    }
}

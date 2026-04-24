const logger = require("../logger");
const user_signup = require("../models/user_signup");
const bcrypt = require("bcrypt");


exports.userSignup = async (req,res,next) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password ){
            logger.error("All fields are required");
            return res.status(400).json({message: "All fields are required"});
        }

        const existingUser = await user_signup.findOne({email});
        if(existingUser){
            logger.error("User already exists.");
            return res.status(400).json({message: "User already exists."});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await user_signup.create({
            name,
            email,
            password: hashedPassword,
        });
        
        logger.info("User registered successfully");
        res.status(201).json({
            message: "User registered successfully",
            user: {
            id: user._id,
            name: user.name,
            email: user.email,
            },
        });
    } catch (error) {
        logger.error("Error in userSignup",error);
        res.status(500).json({
            message: "Error in userSignup",
            error: error.message
        });
    }
}

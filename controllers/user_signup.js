const logger = require("../logger");
const user_signup = require("../models/user_signup");
const Otp = require("../models/otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpMail } = require("../utils/mailer");

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (user) => jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
);

const buildUserResponse = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
});

const createAndSendOtp = async (email) => {
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.deleteMany({ email, purpose: "signup" });
    await Otp.create({
        email,
        purpose: "signup",
        otp: hashedOtp,
        expiresAt: new Date(Date.now() + 60 * 1000),
    });

    await sendOtpMail(email, otp);
};

exports.sendEmailOtp = async (req, res, next) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email && email.toLowerCase().trim();

        if(!normalizedEmail){
            logger.error("Email is required");
            return res.status(400).json({message: "Email is required"});
        }

        await createAndSendOtp(normalizedEmail);

        logger.info("OTP sent successfully");
        return res.status(200).json({message: "OTP sent successfully"});
    } catch (error) {
        logger.error("Error in sendEmailOtp",error);
        return res.status(500).json({
            message: "Error in sendEmailOtp",
            error: error.message
        });
    }
}

exports.userSignup = async (req,res,next) => {
    try {
        const { name, email, phone, password } = req.body;
        const normalizedEmail = email && email.toLowerCase().trim();
        const normalizedPhone = phone && phone.trim();

        if(!name || !normalizedEmail || !normalizedPhone || !password ){
            logger.error("All fields are required");
            return res.status(400).json({message: "All fields are required"});
        }

        const existingUser = await user_signup.findOne({email: normalizedEmail});
        if(existingUser){
            logger.error("User already exists.");
            return res.status(400).json({message: "User already exists."});
        }

        const verifiedOtp = await Otp.findOne({
            email: normalizedEmail,
            purpose: "signup",
            isVerified: true,
            expiresAt: { $gt: new Date() },
        }).sort({ verifiedAt: -1 });

        if(!verifiedOtp){
            logger.error("Email is not verified");
            return res.status(400).json({message: "Please verify your email before signup"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await user_signup.create({
            name,
            email: normalizedEmail,
            phone: normalizedPhone,
            password: hashedPassword,
            isEmailVerified: true,
        });

        await Otp.deleteMany({ email: normalizedEmail, purpose: "signup" });
        
        logger.info("User registered successfully");
        res.status(201).json({
            message: "User registered successfully",
            token: generateToken(user),
            user: buildUserResponse(user),
        });
    } catch (error) {
        logger.error("Error in userSignup",error);
        res.status(500).json({
            message: "Error in userSignup",
            error: error.message
        });
    }
}

exports.verifyEmailOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const normalizedEmail = email && email.toLowerCase().trim();

        if(!normalizedEmail || !otp){
            logger.error("Email and OTP are required");
            return res.status(400).json({message: "Email and OTP are required"});
        }

        const existingUser = await user_signup.findOne({email: normalizedEmail});

        const otpRecord = await Otp.findOne({email: normalizedEmail, purpose: "signup"}).sort({ createdAt: -1 });
        if(!otpRecord || otpRecord.expiresAt < new Date()){
            logger.error("OTP expired or invalid");
            return res.status(400).json({message: "OTP expired or invalid"});
        }

        const isOtpMatch = await bcrypt.compare(otp, otpRecord.otp);
        if(!isOtpMatch){
            logger.error("Invalid OTP");
            return res.status(400).json({message: "Invalid OTP"});
        }

        otpRecord.isVerified = true;
        otpRecord.verifiedAt = new Date();
        otpRecord.expiresAt = new Date(Date.now() + 60 * 1000);
        await otpRecord.save();

        if(existingUser){
            if(!existingUser.isEmailVerified){
                existingUser.isEmailVerified = true;
                await existingUser.save();
            }

            await Otp.deleteMany({ email: normalizedEmail, purpose: "signup" });

            logger.info("User logged in successfully with OTP");
            return res.status(200).json({
                message: "Login successful",
                token: generateToken(existingUser),
                user: buildUserResponse(existingUser),
            });
        }

        logger.info("Email verified successfully");
        return res.status(200).json({message: "Email verified successfully"});
    } catch (error) {
        logger.error("Error in verifyEmailOtp",error);
        return res.status(500).json({
            message: "Error in verifyEmailOtp",
            error: error.message
        });
    }
}

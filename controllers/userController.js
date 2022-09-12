// Imports
import ErrorResponse from "../utils/Error.js"
import User from "../models/userModel.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from "../utils/sendEmail.js";

// New User Registration controller
export const newUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
        // const { avatar } = req.files;

        let user = await User.findOne({ email })
        if (user) {
            return next(new ErrorResponse("User already exisits", 400));
        }

        const randomOtp = crypto.randomBytes(20).toString("hex")
        const otp = crypto
            .createHash("sha256")
            .update(randomOtp)
            .digest("hex")
        console.log(otp)

        user = await User.create({
            username,
            email,
            password,
            avatar: {
                public_id: "",
                url: ""
            },
            otp,
            otp_expiry: Date.now() + process.env.OTP_EXPIRE * 60 * 1000
        });

        const resetToken = user.otp

        const resetUrl = "TODO"
        const message = "TODO"

        await sendEmail(
            email, "Verify Your Accout", message
        )

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                message: "Please verify your email to continue."
            }
        });
    } catch (error) {
        next(error);
    }
};

// Email Verification controller
export const verify = async (req, res, next) => {
    try {
        const email = req.params.e;
        const otp = req.params.vt;
        let user = await User.findOne({ email })
        if (user.otp !== otp || user.otp_expiry < Date.now()) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid OTP or has been Expired" });
        }
        user.verified = true;
        user.otp = null;
        user.otp_expiry = null;

        await user.save();

        const payload = {
            username: user.username,
            id: user._id,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

        res.status(201).json({
            success: true,
            message: "Email Verified successfully",
            token: "Bearer " + token,
        });
    } catch (error) {
        next(error);
    }
};
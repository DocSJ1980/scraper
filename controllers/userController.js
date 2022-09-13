// Imports
import ErrorResponse from "../utils/Error.js"
import User from "../models/userModel.js"
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import sendEmail from "../utils/sendEmail.js"

// New User Registration controller
export const newUser = async (req, res, next) => {
    const { username, email, password } = req.body
    try {
        // const { avatar } = req.files;

        let user = await User.findOne({ email })
        if (user) {
            return next(new ErrorResponse("User already exisits", 400))
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
        let foundUser = await User.findOne({ email })
        if (foundUser.otp !== otp || foundUser.otp_expiry < Date.now()) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid OTP or has been Expired" });
        }
        foundUser.verified = true;
        foundUser.otp = null;
        foundUser.otp_expiry = null;

        await foundUser.save();

        const payload = {
            username: foundUser.username,
            id: foundUser._id,
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

// Login controller
export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400));
    };

    try {
        const foundUser = await User.findOne({ email }).select("+password");
        if (!foundUser) {
            return next(new ErrorResponse("Invalid credentials", 401));
        };

        const isMatch = await foundUser.comparePassword(password);

        if (!isMatch) {
            return next(new ErrorResponse("Invalid credentials", 404));
        } else {
            const payload = {
                username: foundUser.username,
                id: foundUser._id,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

            res.status(200).json({
                success: true,
                message: "Logged in successfully",
                token: "Bearer " + token,
            });
        }


    } catch (error) {
        next(error);
    }
};

// Forgot Password controller
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            return next(new ErrorResponse("Email could not be found", 404))
        }

        await foundUser.getResetPasswordToken()
        await foundUser.save()
        const resetToken = foundUser.resetPasswordOtp

        const resetUrl = `http://scraper.sjcloud.ga:5232/user/restpassword/?resetToken=${resetToken}`
        const message = `TODO= Reset URL: ${resetUrl}`
        try {
            await sendEmail(
                foundUser.email,
                "Password Reset Requeest",
                message
            )
            res.status(200).json({
                success: true,
                data: "Email sent"
            })
        } catch (error) {
            foundUser.resetPasswordOtp = undefined;
            foundUser.resetPasswordOtpExpiry = undefined;
            await foundUser.save();
            return next(new ErrorResponse("Email Could not be sent", 400))
        }
    } catch (error) {
        next(new ErrorResponse("Email not found", 400))
    }
}

// Reset Password Controller
export const resetPassword = async (req, res, next) => {
    try {
        const { resetOtp, newPassword } = req.body;

        const foundUser = await User.findOne({
            resetPasswordOtp: resetOtp,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!foundUser) {
            return res
                .status(400)
                .json({ success: false, message: "Otp Invalid or has been Expired" });
        }
        foundUser.password = newPassword;
        foundUser.resetPasswordOtp = null;
        foundUser.resetPasswordOtpExpiry = null;
        await foundUser.save();

        res
            .status(200)
            .json({ success: true, message: `Password Changed Successfully` });
    } catch (error) {
        next(new ErrorResponse("Email not found", 400))
    }
};

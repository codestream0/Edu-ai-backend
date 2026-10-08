import User from "../models/user.model";
import { loginSchema, signupSchema } from "../validations/auth.validation";
import bcrypt from "bcrypt";
import { transporter } from "../config/mailer";
import crypto from "crypto";
import { render } from "@react-email/render";

import {
  generateAceessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import PasswordResetEmail from "../emails/passwordResetEmail";

export const signup = async (data: unknown) => {
  const validateData = signupSchema.parse(data);

  const { fullName, email, password } = validateData;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashPassword = await bcrypt.hash(password, 12);

  const newUser = await User.create({
    fullName,
    email,
    password: hashPassword,
  });

  const accessToken = generateAceessToken(newUser._id.toString());
  const refreshToken = generateRefreshToken(newUser._id.toString());

  return {
    id: newUser._id,
    fullName: newUser.fullName,
    email: newUser.email,
    accessToken,
    refreshToken,
    createdAt: newUser.createdAt,
  };
};

export const login = async (data: unknown) => {
  const validateData = loginSchema.parse(data);
  const { email, password } = validateData;

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new Error("User credentials not found ");
  }
  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    throw new Error("User password is invalid");
  }
  console.log(existingUser);
  const accessToken = generateAceessToken(existingUser._id.toString());
  const refreshToken = generateRefreshToken(existingUser._id.toString());

  return {
    id: existingUser._id,
    fullName: existingUser.fullName,
    email: existingUser.email,
    accessToken,
    refreshToken,
    createdAt: existingUser.createdAt,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new Error("user not found");
  }

  return generateAceessToken(user._id.toString());
};

export const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email }).select(
    "+passwordResetTokenHash +passwordResetExpiresAt",
  );

  if (!user) {
    return {
      message:
        "If an account exists with that email, a password reset link has been sent.",
    };
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const resetTokenExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

  user.passwordResetTokenHash = resetTokenHash;
  user.passwordResetExpiresAt = resetTokenExpiresAt;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const emailHtml = await render(
    PasswordResetEmail({
      resetUrl,
    }),
  );

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: user.email,
    subject: "Reset your EDU AI password",
    html: emailHtml,
    text: `Reset your EDU AI password: ${resetUrl}`,
  });

  return {
    message:
      "If an account exists with that email, a password reset link has been sent.",
  };
};

export const resetPassword = async (
  resetToken: string,
  newPassword: string,
) => {
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetTokenHash: resetTokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select("+passwordResetTokenHash +passwordResetExpiresAt");

  if (!user) {
    throw new Error("Invalid or expired reset token");
  }
  user.password = await bcrypt.hash(newPassword, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();

  return {
    message: "Password reset successfully",
  };
};

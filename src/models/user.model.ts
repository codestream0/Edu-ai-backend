import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  passwordResetTokenHash?: string | null;
  passwordResetExpiresAt?: Date | null;
  preferences: {
    theme: "light" | "dark" | "system";
    notifications: {
      studyReminders: boolean;
      quizResults: boolean;
      productUpdates: boolean;
    };
  };
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      select: false,
    },
    passwordResetTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      notifications: {
        studyReminders: { type: Boolean, default: true },
        quizResults: { type: Boolean, default: true },
        productUpdates: { type: Boolean, default: false },
      },
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model<IUser>("user", userSchema);

export default User;

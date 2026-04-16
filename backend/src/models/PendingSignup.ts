import { Schema, model, type InferSchemaType } from "mongoose";

const pendingSignupSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["tenant", "landlord"], required: true, default: "tenant" },
    verificationCodeHash: { type: String, required: true },
    codeExpiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

pendingSignupSchema.index({ codeExpiresAt: 1 }, { expireAfterSeconds: 0 });

export type PendingSignupDocument = InferSchemaType<typeof pendingSignupSchema> & { _id: Schema.Types.ObjectId };
export const PendingSignupModel = model("PendingSignup", pendingSignupSchema);
import { Schema, model, type InferSchemaType } from "mongoose";

const landlordProfileSchema = new Schema(
  {
    businessType: {
      type: String,
      enum: ["individual", "dealer", "agency"],
      required: true,
    },
    numberOfProperties: { type: Number, required: true, default: 0 },
    phoneNumber: { type: String, required: true },
    businessName: { type: String },
    licenseNumber: { type: String },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["tenant", "landlord"], required: true, default: "tenant" },
    isLandlord: { type: Boolean, default: false },
    landlordProfile: { type: landlordProfileSchema, required: false },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };
export const UserModel = model("User", userSchema);

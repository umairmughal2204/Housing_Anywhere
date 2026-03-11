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
    dateOfBirth: { type: String, required: false },
    gender: { type: String, enum: ["male", "female", "other"], required: false },
    cityOfResidence: { type: String, required: false, trim: true },
    nationality: { type: String, required: false, trim: true },
    occupation: { type: String, enum: ["student", "working", "other"], required: false },
    organization: { type: String, required: false, trim: true },
    aboutMe: { type: String, required: false, trim: true },
    languages: { type: [String], required: false, default: [] },
    phoneCountryCode: { type: String, required: false, default: "+1" },
    phoneNumber: { type: String, required: false, trim: true },
    emailVerified: { type: Boolean, required: true, default: false },
    phoneVerified: { type: Boolean, required: true, default: false },
    profilePictureUrl: { type: String, required: false, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["tenant", "landlord"], required: true, default: "tenant" },
    isLandlord: { type: Boolean, default: false },
    landlordProfile: { type: landlordProfileSchema, required: false },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: Schema.Types.ObjectId };
export const UserModel = model("User", userSchema);

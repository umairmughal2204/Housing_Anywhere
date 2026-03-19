import { Schema, model, type InferSchemaType } from "mongoose";

const rentalApplicationDocumentSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["enrollment", "employment", "income", "profile"],
      required: true,
    },
    name: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const rentalApplicationSchema = new Schema(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    dateOfBirth: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    countryCode: { type: String },
    mobileNumber: { type: String },
    moveInCount: { type: Number, min: 1, default: 1 },
    withPets: { type: Boolean, default: false },
    occupation: { type: String, enum: ["student", "professional", "other"] },
    universityName: { type: String },
    visaStatus: { type: String },
    paymentMethods: { type: [String], default: [] },
    monthlyBudget: { type: String },
    employerName: { type: String },
    income: { type: String },
    supportingMessage: { type: String },
    idVerified: { type: Boolean, default: false },
    shareDocuments: { type: Boolean, default: false },
    documents: { type: [rentalApplicationDocumentSchema], default: [] },
  },
  { timestamps: true }
);

export type RentalApplicationDocument = InferSchemaType<typeof rentalApplicationDocumentSchema>;
export type RentalApplication = InferSchemaType<typeof rentalApplicationSchema> & {
  _id: Schema.Types.ObjectId;
};

export const RentalApplicationModel = model("RentalApplication", rentalApplicationSchema);

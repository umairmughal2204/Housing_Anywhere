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

const billingAddressSchema = new Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    country: { type: String, default: "" },
    street: { type: String, default: "" },
    apartmentNumber: { type: String, default: "" },
    city: { type: String, default: "" },
    stateProvince: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    confirmed: { type: Boolean, default: false },
  },
  { _id: false }
);

const paymentDetailsSchema = new Schema(
  {
    method: { type: String, enum: ["card", "ideal", "bancontact"], default: "card" },
    cardLast4: { type: String, default: "" },
    expiryDate: { type: String, default: "" },
    cardholderName: { type: String, default: "" },
    isPaid: { type: Boolean, default: false },
    paidAmount: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
    addRentGuarantee: { type: Boolean, default: false },
    rentGuaranteeFee: { type: Number, default: 0 },
    tenantProtectionFee: { type: Number, default: 0 },
    rentForSelectedPeriod: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
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
    moveInDate: { type: Date },
    moveOutDate: { type: Date },
    moveInAvailabilityConfirmed: { type: Boolean, default: false },
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
    billingAddress: { type: billingAddressSchema, default: {} },
    paymentDetails: { type: paymentDetailsSchema, default: {} },
    documents: { type: [rentalApplicationDocumentSchema], default: [] },
  },
  { timestamps: true }
);

export type RentalApplicationDocument = InferSchemaType<typeof rentalApplicationDocumentSchema>;
export type RentalApplication = InferSchemaType<typeof rentalApplicationSchema> & {
  _id: Schema.Types.ObjectId;
};

export const RentalApplicationModel = model("RentalApplication", rentalApplicationSchema);

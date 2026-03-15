import { Schema, model, type InferSchemaType } from "mongoose";

const listingSchema = new Schema(
  {
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    propertyType: {
      type: String,
      enum: ["apartment", "studio", "house", "room"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 1 },
    area: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    deposit: { type: Number, required: true, min: 0 },
    availableFrom: { type: Date, required: true },
    minStay: { type: Number, required: true, min: 1 },
    utilitiesIncluded: { type: Boolean, default: false },
    utilitiesCost: { type: Number, default: 0, min: 0 },
    registrationPossible: { type: Boolean, default: false },
    amenities: { type: [String], default: [] },
    houseRules: { type: [String], default: [] },
    images: { type: [String], default: [] },
    views: { type: Number, default: 0 },
    inquiries: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "draft", "inactive"],
      default: "draft",
      index: true,
    },
  },
  { timestamps: true }
);

export type ListingDocument = InferSchemaType<typeof listingSchema> & { _id: Schema.Types.ObjectId };
export const ListingModel = model("Listing", listingSchema);

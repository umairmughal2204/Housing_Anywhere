import { Schema, model, type InferSchemaType } from "mongoose";

const listingSchema = new Schema(
  {
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
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

import { Schema, model, type InferSchemaType } from "mongoose";

const listingInteractionSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    interactionType: {
      type: String,
      enum: ["view"],
      required: true,
      default: "view",
    },
    count: { type: Number, required: true, default: 1, min: 1 },
    lastInteractedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: true }
);

listingInteractionSchema.index({ tenantId: 1, listingId: 1, interactionType: 1 }, { unique: true });

export type ListingInteraction = InferSchemaType<typeof listingInteractionSchema> & {
  _id: Schema.Types.ObjectId;
};

export const ListingInteractionModel = model("ListingInteraction", listingInteractionSchema);
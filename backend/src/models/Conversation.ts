import { Schema, model, type InferSchemaType } from "mongoose";

const conversationSchema = new Schema(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    unreadByTenant: { type: Number, default: 0 },
    unreadByLandlord: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One conversation per tenant+landlord+listing combination
conversationSchema.index({ tenantId: 1, landlordId: 1, listingId: 1 }, { unique: true });

export type Conversation = InferSchemaType<typeof conversationSchema> & {
  _id: Schema.Types.ObjectId;
};

export const ConversationModel = model("Conversation", conversationSchema);

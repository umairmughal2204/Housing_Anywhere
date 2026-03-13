import { Schema, model, type InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["tenant", "landlord"], required: true },
    body: { type: String, required: true, maxlength: 4000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// For efficiently paginating messages in chronological order
messageSchema.index({ conversationId: 1, createdAt: 1 });

export type Message = InferSchemaType<typeof messageSchema> & {
  _id: Schema.Types.ObjectId;
};

export const MessageModel = model("Message", messageSchema);

import { Schema, model, type InferSchemaType } from "mongoose";

const pageViewSchema = new Schema(
  {
    path: { type: String, required: true, trim: true, maxlength: 300 },
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    referrerHost: { type: String, default: "direct" },
    device: {
      type: String,
      enum: ["mobile", "tablet", "desktop"],
      default: "desktop",
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
  },
  { timestamps: true }
);

pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ path: 1, createdAt: -1 });

export type PageView = InferSchemaType<typeof pageViewSchema> & {
  _id: Schema.Types.ObjectId;
};

export const PageViewModel = model("PageView", pageViewSchema);

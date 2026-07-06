import { Schema, model, type InferSchemaType } from "mongoose";

const platformSettingsSchema = new Schema(
  {
    // Singleton key so there's always exactly one settings document.
    key: { type: String, required: true, default: "default", unique: true },
    tenantProtectionFeeRate: { type: Number, required: true, default: 10, min: 0, max: 100 },
    tenantProtectionFeeCap: { type: Number, required: true, default: 250, min: 0 },
  },
  { timestamps: true }
);

export type PlatformSettings = InferSchemaType<typeof platformSettingsSchema> & {
  _id: Schema.Types.ObjectId;
};

export const PlatformSettingsModel = model("PlatformSettings", platformSettingsSchema);

export async function getPlatformSettings() {
  const settings = await PlatformSettingsModel.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default" } },
    { upsert: true, new: true }
  ).lean();

  return settings;
}

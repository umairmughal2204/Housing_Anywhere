import { Schema, model, type InferSchemaType } from "mongoose";

const listingSchema = new Schema(
  {
    // LANDLORD REFERENCE
    landlordId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // ===== SECTION 1: PROPERTY TYPE & ADDRESS =====
    kind: {
      type: String,
      enum: ["entire-place", "private-room", "shared-room"],
      required: true,
    },
    propertyType: {
      type: String,
      enum: ["house", "apartment", "building"],
      required: true,
    },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, default: "Netherlands" },
    apartmentNumber: { type: String }, // Optional, for apartments/buildings
    floorNumber: { type: String }, // Optional, for apartments/buildings
    isGroundFloor: { type: Boolean, default: false },
    rentalRegistrationNumber: { type: String }, // Optional, can be provided for any property type

    // ===== SECTION 1: RENTAL DATES & PRICING =====
    availableFrom: { type: Date, required: true },
    monthlyRent: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["EUR", "USD", "GBP"], default: "EUR" },
    minimumRentalPeriod: { type: Number, required: true, min: 1 }, // in months
    maximumRentalPeriod: { type: Number }, // in months, optional

    // ===== SECTION 2: SPACE =====
    propertySize: { type: Number, required: true, min: 1 }, // m²
    suitablePeopleCount: { type: Number, default: 1 },
    spaceDescription: { type: String, required: true },
    bedroomsCount: { type: Number, required: true, min: 0 },
    bedroomFurnished: { type: Boolean, default: false },
    lockOnBedroom: { type: Boolean, default: false },

    // ===== SECTION 3: AREAS (Rooms & Facilities) =====
    kitchen: {
      type: String,
      enum: ["no", "shared", "private"],
      default: "private",
    },
    toilet: {
      type: String,
      enum: ["no", "shared", "private"],
      default: "private",
    },
    bathroomStructure: {
      count: { type: Number, required: true, min: 0 },
      type: {
        type: String,
        enum: ["none", "private", "male", "female", "mixed"],
        default: "private",
      },
    },
    livingRoom: {
      type: String,
      enum: ["no", "shared", "private"],
      default: "private",
    },
    balconyTerrace: {
      type: String,
      enum: ["no", "shared", "private"],
      default: "no",
    },
    garden: {
      type: String,
      enum: ["no", "shared", "private"],
      default: "no",
    },
    basement: {
      type: String,
      enum: ["no", "shared", "private"],
      default: "no",
    },
    parking: {
      type: String,
      enum: ["no", "shared", "private"],
      default: "no",
    },
    wheelchairAccessible: { type: Boolean, default: false },
    elevator: { type: Boolean, default: false },
    allergyFriendly: { type: Boolean, default: false },

    // ===== SECTION 4: AMENITIES =====
    amenities: {
      bed: { type: Boolean, default: false },
      wifi: { type: Boolean, default: false },
      desk: { type: Boolean, default: false },
      closet: { type: Boolean, default: false },
      tv: { type: Boolean, default: false },
      washingMachine: { type: Boolean, default: false },
      dryer: { type: Boolean, default: false },
      dishwasher: { type: Boolean, default: false },
      kitchenware: {
        type: String,
        enum: ["no", "shared", "private"],
        default: "private",
      },
      heating: {
        type: String,
        enum: ["central-heating", "electric", "gas", "district-heating", "floor-heating"],
        default: "central-heating",
      },
      airConditioning: { type: Boolean, default: false },
      flooring: {
        type: String,
        enum: ["laminate", "carpet", "stone", "wood", "plastic", "other"],
        default: "laminate",
      },
      livingRoomFurniture: { type: Boolean, default: false },
    },

    // ===== SECTION 5: RENTAL CONDITIONS & COSTS =====
    rentCalculation: {
      type: String,
      enum: ["daily", "half-monthly", "monthly"],
      default: "monthly",
    },
    cancellationPolicy: {
      type: String,
      enum: ["strict", "flexible"],
      default: "flexible",
    },

    // UTILITIES
    utilities: [
      {
        type: { type: String }, // e.g., "electricity", "water", "heating", "internet", "gas"
        frequency: { type: String, enum: ["monthly", "quarterly", "yearly"], default: "monthly" },
        included: { type: Boolean, default: false },
        amount: { type: Number, default: 0, min: 0 },
      },
    ],

    // DEPOSITS
    deposits: [
      {
        type: { type: String }, // e.g., "security-deposit", "key-deposit"
        requirement: { type: String }, // e.g., "required", "negotiable", "refundable"
        amount: { type: Number, required: true, min: 0 },
      },
    ],

    // OPTIONAL SERVICES / ADDITIONAL COSTS
    optionalServices: [
      {
        type: { type: String }, // e.g., "parking", "pet-fee", "insurance"
        category: { type: String }, // e.g., "transport", "pet", "wellness"
        frequency: { type: String, enum: ["monthly", "one-time"], default: "monthly" },
        amount: { type: Number, required: true, min: 0 },
      },
    ],

    // ===== SECTION 6: TENANT PREFERENCES & RULES =====
    preferredGender: {
      type: String,
      enum: ["male", "female", "no-preference"],
      default: "no-preference",
    },
    minimumAgePreference: { type: Number }, // e.g., 18
    maximumAgePreference: { type: Number }, // e.g., 50
    preferredTenantType: {
      type: String,
      enum: ["any", "students", "working"],
      default: "any",
    },
    couplesAllowed: { type: Boolean, default: true },
    registrationPossible: { type: Boolean, default: false },
    petsPolicy: {
      type: String,
      enum: ["no", "yes", "negotiable"],
      default: "negotiable",
    },
    musicPolicy: {
      type: String,
      enum: ["no", "yes", "negotiable"],
      default: "negotiable",
    },
    smokingPolicy: {
      type: String,
      enum: ["no", "yes", "negotiable", "outside-only"],
      default: "no",
    },
    requireProofOfIdentity: { type: Boolean, default: false },
    requireProofOfOccupation: { type: Boolean, default: false },
    requireProofOfIncome: { type: Boolean, default: false },

    // ===== SECTION 7: MEDIA & PERMISSIONS =====
    media: [
      {
        url: { type: String, required: true },
        type: {
          type: String,
          enum: ["photo", "360", "floor-plan"],
          default: "photo",
        },
        order: { type: Number, default: 0 },
      },
    ],
    agreedToTerms: { type: Date }, // When user accepted T&C
    houseRules: { type: [String], default: [] }, // Legacy support

    // ===== METADATA =====
    title: { type: String, required: true },
    views: { type: Number, default: 0, index: true },
    inquiries: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "draft", "inactive"],
      default: "active",
      index: true,
    },
    version: { type: Number, default: 2 }, // Schema version for migration tracking
  },
  { timestamps: true }
);

// Indexes for common queries
listingSchema.index({ landlordId: 1, status: 1 });
listingSchema.index({ city: 1, status: 1 });
listingSchema.index({ propertyType: 1, status: 1 });
listingSchema.index({ kind: 1, status: 1 });

export type ListingDocument = InferSchemaType<typeof listingSchema> & { _id: Schema.Types.ObjectId };
export const ListingModel = model("Listing", listingSchema);

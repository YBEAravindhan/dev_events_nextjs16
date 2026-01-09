import {
  Schema,
  model,
  type Document,
  type Model,
  Types,
} from "mongoose";

import { Event } from "./event.model";

// Strongly typed Booking document interface
export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<BookingDocument>;

const bookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index on eventId for faster booking lookups by event
bookingSchema.index({ eventId: 1 });

// Simple, pragmatic email validation pattern
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Pre-save hook: validate email and ensure referenced Event exists
bookingSchema.pre("save", async function preSave(next) {
  const normalizedEmail = (this.email ?? "").trim().toLowerCase();
  if (!emailPattern.test(normalizedEmail)) {
    return next(new Error("Email must be a valid email address."));
  }
  this.email = normalizedEmail;

  // Ensure the referenced event exists before saving the booking
  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    return next(new Error("Booking must reference an existing event."));
  }

  next();
});

export const Booking = model<BookingDocument, BookingModel>(
  "Booking",
  bookingSchema
);

import { Schema, model, models, type Model, type HydratedDocument, type Types } from 'mongoose';
import { Event, type EventDocument } from './event.model';

// Public booking shape used in TypeScript
export interface Booking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose-specific document type
export type BookingDocument = HydratedDocument<Booking>;

// Mongoose model type for Booking
export type BookingModel = Model<BookingDocument>;

// Simple email validator pattern (not exhaustive, but robust enough for most cases)
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true, // index on eventId to speed up event-centric queries
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailPattern.test(value),
        message: 'Email must be a valid email address.',
      },
    },
  },
  {
    timestamps: true, // automatically manage createdAt / updatedAt
    strict: true,
  },
);

// Pre-save hook to ensure that the referenced event exists and email is valid
bookingSchema.pre('save', async function preSave(next) {
  const doc = this as BookingDocument;

  if (!doc.eventId) {
    return next(new Error('eventId is required for a booking.'));
  }

  // Verify that the referenced Event exists before creating the booking
  const eventExists: Pick<EventDocument, '_id'> | null = await Event.exists({ _id: doc.eventId }).select('_id');

  if (!eventExists) {
    return next(new Error('Cannot create booking: referenced event does not exist.'));
  }

  // Email is already validated via schema-level validator, but we guard again to fail fast
  if (!emailPattern.test(doc.email)) {
    return next(new Error('Email must be a valid email address.'));
  }

  next();
});

// Reuse existing model in hot-reload environments (Next.js dev)
export const Booking =
  (models.Booking as BookingModel) || model<BookingDocument, BookingModel>('Booking', bookingSchema);

export default Booking;

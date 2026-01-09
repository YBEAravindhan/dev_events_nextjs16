import { Schema, model, type Document, type Model } from "mongoose";

// Strongly typed Event document interface
export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  venue: string;
  location: string;
  mode: string; // e.g., online, offline, hybrid
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  date: Date;
  time: string; // normalized to HH:MM (24h)
  createdAt: Date;
  updatedAt: Date;
}

export type EventModel = Model<EventDocument>;

// Helper to generate a URL-friendly slug from the title
const slugify = (title: string): string =>
  title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const nonEmptyArray = (value: string[]): boolean =>
  Array.isArray(value) && value.length > 0 && value.every((item) => item.trim().length > 0);

const eventSchema = new Schema<EventDocument, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: nonEmptyArray,
        message: "Agenda must contain at least one non-empty item.",
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: nonEmptyArray,
        message: "Tags must contain at least one non-empty item.",
      },
    },
    date: { type: Date, required: true },
    time: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
);

// Unique index on slug for fast lookups and to prevent duplicates
eventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook: generate slug, normalize date/time, and validate required strings
eventSchema.pre("save", function preSave(next) {
  // Regenerate slug only when the title is new or changed
  if (this.isNew || this.isModified("title")) {
    this.slug = slugify(this.title);
  }

  // Normalize and validate date to a real Date instance (ISO-compatible)
  const rawDate = this.date as unknown as string | Date | undefined;
  if (!rawDate) {
    return next(new Error("Event date is required."));
  }
  const parsedDate = rawDate instanceof Date ? rawDate : new Date(rawDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return next(new Error("Event date must be a valid date."));
  }
  this.date = parsedDate;

  // Normalize time to HH:MM (24h) while accepting common inputs like "9:00 AM"
  const rawTime = (this.time ?? "").trim();
  if (!rawTime) {
    return next(new Error("Event time is required."));
  }
  const match = rawTime.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
  if (!match) {
    return next(
      new Error("Event time must be in HH:MM or HH:MM AM/PM format.")
    );
  }

  let hour = Number.parseInt(match[1], 10);
  const minute = Number.parseInt(match[2], 10);
  const ampm = match[3]?.toLowerCase();

  if (minute < 0 || minute > 59 || hour < 0 || hour > 23) {
    return next(new Error("Event time must be a valid time."));
  }

  // Convert AM/PM to 24h if provided
  if (ampm) {
    const isPm = ampm === "pm";
    hour = hour % 12;
    if (isPm) {
      hour += 12;
    }
  }

  this.time = `${hour.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")}`;

  // Ensure required string fields are present and non-empty after trimming
  const requiredStringFields: Array<keyof EventDocument> = [
    "title",
    "description",
    "overview",
    "venue",
    "location",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredStringFields) {
    const value = String(this[field] ?? "").trim();
    if (!value) {
      return next(
        new Error(`Field "${String(field)}" is required and cannot be empty.`)
      );
    }
  }

  next();
});

export const Event = model<EventDocument, EventModel>("Event", eventSchema);

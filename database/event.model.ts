import { Schema, model, models, type Model, type HydratedDocument } from 'mongoose';

// Public event shape used in TypeScript
export interface Event {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO-normalized date string (YYYY-MM-DD)
  time: string; // Normalized 24h time string (HH:MM)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose-specific document type
export type EventDocument = HydratedDocument<Event>;

// Mongoose model type for better typing when using `EventModel`
export type EventModel = Model<EventDocument>;

// Basic slug generator to create URL-friendly slugs from titles
const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumerics with dashes
    .replace(/^-+|-+$/g, ''); // trim leading/trailing dashes
};

// Validate that a string is non-empty after trimming whitespace
const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const eventSchema = new Schema<EventDocument, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: unknown[]): boolean =>
          Array.isArray(value) && value.every((item) => isNonEmptyString(item)),
        message: 'Agenda must be an array of non-empty strings.',
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: unknown[]): boolean =>
          Array.isArray(value) && value.every((item) => isNonEmptyString(item)),
        message: 'Tags must be an array of non-empty strings.',
      },
    },
  },
  {
    timestamps: true, // automatically manage createdAt / updatedAt
    strict: true,
  },
);

// Extra safety to enforce unique slugs at the database/index level
eventSchema.index({ slug: 1 }, { unique: true });

// Normalize and validate date/time & generate slug before saving
eventSchema.pre('save', function preSave(next) {
  const doc = this as EventDocument;

  // Validate presence of required string fields at runtime
  const requiredStringFields: (keyof Event)[] = [
    'title',
    'description',
    'overview',
    'image',
    'venue',
    'location',
    'mode',
    'audience',
    'organizer',
  ];

  for (const field of requiredStringFields) {
    const value = doc[field];
    if (!isNonEmptyString(value)) {
      return next(new Error(`Field "${field}" is required and must be a non-empty string.`));
    }
  }

  // Generate or regenerate slug only when title has changed
  if (doc.isModified('title') || !isNonEmptyString(doc.slug)) {
    doc.slug = slugify(doc.title);
  }

  // Normalize the date into an ISO date-only string (YYYY-MM-DD)
  if (doc.isModified('date')) {
    const parsedDate = new Date(doc.date);
    if (Number.isNaN(parsedDate.getTime())) {
      return next(new Error('Invalid date format. Expected a parseable date string.'));
    }

    // ISO 8601 date-only (no time component)
    const isoDateOnly = parsedDate.toISOString().slice(0, 10);
    doc.date = isoDateOnly;
  }

  // Normalize time into 24h HH:MM format
  if (doc.isModified('time')) {
    const rawTime = doc.time.trim();

    // Accepts formats like HH:MM, H:MM, HHMM, and normalizes to HH:MM (24h)
    const match = rawTime.match(/^(\d{1,2})(?::?(\d{2}))$/);
    if (!match) {
      return next(
        new Error(
          'Invalid time format. Expected 24h time such as "HH:MM" or "H:MM".',
        ),
      );
    }

    const hours = Number.parseInt(match[1] ?? '', 10);
    const minutes = Number.parseInt(match[2] ?? '0', 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      return next(new Error('Time must be a valid 24h time between 00:00 and 23:59.'));
    }

    const normalizedTime = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;

    doc.time = normalizedTime;
  }

  next();
});

// Reuse existing model in hot-reload environments (Next.js dev) to avoid OverwriteModelError
export const Event = (models.Event as EventModel) || model<EventDocument, EventModel>('Event', eventSchema);

export default Event;

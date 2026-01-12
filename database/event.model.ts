import { Schema, model, models, type Model, type HydratedDocument } from 'mongoose';

/* ================================
   1. Public Event Shape (TypeScript)
================================ */
export interface Event {
  id:number;
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}


/* ================================
   2. Mongoose Types
================================ */
export type EventDocument = HydratedDocument<Event>;
export type EventModelType = Model<EventDocument>;

/* ================================
   3. Helpers
================================ */
const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/* ================================
   4. Schema
================================ */
const eventSchema = new Schema<EventDocument, EventModelType>(
  {
    title: { type: String, required: true, trim: true },

    // ⚠️ slug is GENERATED → NOT required
    slug: { type: String},

    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },

    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:MM

    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },

    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (v: unknown[]) =>
          Array.isArray(v) && v.every(isNonEmptyString),
        message: 'Agenda must be an array of non-empty strings',
      },
    },

    organizer: { type: String, required: true, trim: true },

    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: unknown[]) =>
          Array.isArray(v) && v.every(isNonEmptyString),
        message: 'Tags must be an array of non-empty strings',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

/* ================================
   5. Indexes
================================ */
eventSchema.index({ slug: 1 }, { unique: true });

/* ================================
   6. Pre-save Hook
================================ */
eventSchema.pre('save', function () {
  const doc = this as EventDocument;

  /* ---- Required string validation ---- */
  const requiredFields: (keyof Event)[] = [
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

  for (const field of requiredFields) {
    if (!isNonEmptyString(doc[field])) {
      throw new Error(`Field "${field}" is required and must be non-empty`);
    }
  }

  /* ---- Slug generation ---- */
  if (!doc.slug || doc.isModified('title')) {
    doc.slug = slugify(doc.title);
  }

  /* ---- Date normalization ---- */
  if (doc.isModified('date')) {
    const parsed = new Date(doc.date);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error('Invalid date format');
    }
    doc.date = parsed.toISOString().slice(0, 10);
  }

  /* ---- Time normalization ---- */
  if (doc.isModified('time')) {
    const match = doc.time.trim().match(/^(\d{1,2}):?(\d{2})$/);
    if (!match) {
      throw new Error('Time must be in HH:MM (24h) format');
    }

    const hours = Number(match[1]);
    const minutes = Number(match[2]);

    if (hours > 23 || minutes > 59) {
      throw new Error('Invalid time value');
    }

    doc.time = `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}`;
  }
});

/* ================================
   7. Model Export (Next.js Safe)
================================ */
export const Event =
  (models.Event as EventModelType) ||
  model<EventDocument, EventModelType>('Event', eventSchema);

export default Event;

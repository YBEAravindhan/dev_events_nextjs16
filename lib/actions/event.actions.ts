"use server";

import { Event } from "@/database";
import connectDB from "../mongodb";

export const getSimiliarEventsBySlug = async (slug: string) => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean();

    if (!event) return [];

    return await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .limit(4)
      .lean(); // 🔥 REQUIRED
  } catch (error) {
    console.error(error);
    return [];
  }
};

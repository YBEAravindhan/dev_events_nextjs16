import event1 from "../public/images/event1.png";
import event2 from "../public/images/event2.png";
import event3 from "../public/images/event3.png";
import event4 from "../public/images/event4.png";
import event5 from "../public/images/event5.png";
import event6 from "../public/images/event5.png";
import event7 from "../public/images/event-full.png";

import { StaticImageData } from "next/image";



export type EventItem = {
  image: StaticImageData;
  title: string;
  slug: string;
  location: string;
  date: string; // e.g., "2025-11-07"
  time: string; // e.g., "09:00 AM"
};

export const events: EventItem[] = [
  {
    image: event1,
    title: "React Summit US 2025",
    slug: "react-summit-us-2025",
    location: "San Francisco, CA, USA",
    date: "2025-11-07",
    time: "09:00 AM",
  },
  {
    image: event2,
    title: "KubeCon + CloudNativeCon Europe 2026",
    slug: "kubecon-cloudnativecon-eu-2026",
    location: "Vienna, Austria",
    date: "2026-03-18",
    time: "10:00 AM",
  },
  {
    image: event3,
    title: "AWS re:Invent 2025",
    slug: "aws-reinvent-2025",
    location: "Las Vegas, NV, USA",
    date: "2025-12-01",
    time: "08:30 AM",
  },
  {
    image: event4,
    title: "Next.js Conf 2025",
    slug: "nextjs-conf-2025",
    location: "Los Angeles, CA, USA (Hybrid)",
    date: "2025-11-12",
    time: "09:30 AM",
  },
  {
    image: event5,
    title: "Google Cloud Next 2026",
    slug: "google-cloud-next-2026",
    location: "San Jose, CA, USA",
    date: "2026-04-07",
    time: "09:00 AM",
  },
  {
    image: event6,
    title: "ETHGlobal Hackathon: Paris 2026",
    slug: "ethglobal-paris-2026",
    location: "Paris, France",
    date: "2026-07-10",
    time: "10:00 AM",
  },
  {
    image: event7,
    title: "Open Source Summit North America 2026",
    slug: "oss-na-2026",
    location: "Vancouver, Canada",
    date: "2026-06-22",
    time: "09:00 AM",
  },
];

export default events;
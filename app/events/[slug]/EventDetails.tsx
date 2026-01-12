import Image from "next/image";
import { notFound } from "next/navigation";
import calendarIcon from "../../../public/icons/calendar.svg";
import clockIcon from "../../../public/icons/clock.svg";
import pinIcon from "../../../public/icons/pin.svg";
import modeIcon from "../../../public/icons/mode.svg";
import audienceIcon from "../../../public/icons/audience.svg";
import BookEvents from "@/components/BookEvents";
import Event from "../../../database/event.model";
import { getSimiliarEventsBySlug } from "@/lib/actions/event.actions";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ---------- Small reusable row ----------
const EventDetailItem = ({
  icon,
  alt,
  label,
}: {
  icon: string;
  alt: string;
  label: string;
}) => (
  <div className="flex items-center gap-2">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);


// ---------- Data Component ----------
export default async function EventDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) return notFound();

  const res = await fetch(`${BASE_URL}/api/events/${slug}`, {
    cache: "force-cache",
  });

  if (!res.ok) return notFound();

  const { event } = await res.json();
  if (!event) return notFound();

  const {
    description,
    image,
    overview,
    date,
    time,
    location,
    mode,
    audience,
  } = event;

  if (!description) return notFound();

  const bookings = 10;


  const similiarEvents: Event[] = await getSimiliarEventsBySlug(slug); 

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        <div className="content">
          <Image
            src={image || "/placeholder.jpg"}
            alt="Event Banner"
            width={800}
            height={450}
            className="banner"
          />

          <section>
            <h2>Overview</h2>
            <p>{overview}</p>
          </section>

         

          <section>
            <h2>Event Details</h2>
            <EventDetailItem icon={calendarIcon} alt="date" label={date} />
            <EventDetailItem icon={clockIcon} alt="time" label={time} />
            <EventDetailItem icon={pinIcon} alt="location" label={location} />
            <EventDetailItem icon={modeIcon} alt="mode" label={mode} />
            <EventDetailItem
              icon={audienceIcon}
              alt="audience"
              label={audience}
            />
          </section>
        </div>

        <aside className="booking">
            <div className="signup-card">
                <h2>Book Your Spot</h2>
                {bookings > 0 ? (
                    <p className="text-sm">
                        Join {bookings} people who have already booked their spot!  
                    </p>
                ):(
                    <p className="text-sm">Be the first to book your spot!</p>
                ) }

                <BookEvents/>
            </div>
        </aside>
      </div>

      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similiar Events</h2>
        <div className="events">
            {similiarEvents.length > 0 && similiarEvents.map((similiarEvent: Event)=> (
             <EventCard
  key={similiarEvent.title.toString()}
  {...similiarEvent}
/>

            ))}
        </div>
      </div>


    </section>
  );
}

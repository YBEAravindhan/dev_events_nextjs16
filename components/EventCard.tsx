import Image from "next/image";
import Link from "next/link";
import pin from "../public/icons/pin.svg";
import calender from "../public/icons/calendar.svg";
import clock from "../public/icons/clock.svg";

interface Props {
  title: string;
  image: string; 
  slug: string;
  location: string;
  date: string;
  time: string;
}


const EventCard = ({ title, image, slug, location, date, time }: Props) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      <img
        src={image || "/placeholder.jpg"}
        alt={title}
        width={410}
        height={300}
        className="poster"
      />

      <div className="flex flex-row gap-2">
        <Image src={pin} alt="location" width={24} height={14} />
        <p>{location}</p>
      </div>

      <p className="title">{title}</p>

      <div className="datetime">
        <Image src={calender} alt="date" width={14} height={14} />
        <p>{date}</p>
      </div>
      <div className="datetime">
        <Image src={clock} alt="date" width={14} height={14} />
        <p>{time}</p>
      </div>
    </Link>
  );
};

export default EventCard;

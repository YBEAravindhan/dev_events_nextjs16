import Image from "next/image";
import Link from "next/link";
import logo from "../public/icons/logo.png";

const Navbar = () => {
  return (
    <header>
      <nav>
        <Link href="/" className="logo">
          <Image src={logo} alt="DevEvent logo" width={24} height={24} />
          <p>DevEvent</p>
        </Link>

        <ul className="flex gap-6">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/events">Events</Link>
          </li>
          <li>
            <Link href="/create">Create Events</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;

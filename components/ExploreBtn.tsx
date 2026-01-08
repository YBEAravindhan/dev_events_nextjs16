"use client";

import Image from "next/image";

import arrow_down from "../public/icons/arrow-down.svg"

const ExploreBtn = () => {
  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7"
      onClick={() => console.log("CLICK")}
    >
      <a href="#events">
        Explore Events
        <Image src={arrow_down} alt="arrow-down" width={24} height={24}/>
        </a>
    </button>
  );
};

export default ExploreBtn;

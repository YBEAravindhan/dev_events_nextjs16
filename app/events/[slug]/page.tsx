import { Suspense } from "react";
import EventDetails from "./EventDetails";

export default function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<div>Loading event...</div>}>
      <EventDetails params={params} />
    </Suspense>
  );
}

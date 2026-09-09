import { Navbar } from "../../src/components/Navbar";
import { Footer } from "../../src/components/Footer";
import { EventsCatalogClient } from "../../src/components/EventsCatalogClient";
import { getEventsFromDB } from "../../src/lib/site-config.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EventsPage() {
  const events = await getEventsFromDB();

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
      <Navbar />
      <EventsCatalogClient events={events} />
      <Footer />
    </div>
  );
}

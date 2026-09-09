import { Navbar } from "../../src/components/Navbar";
import { Footer } from "../../src/components/Footer";
import { TalentsCatalogClient } from "../../src/components/TalentsCatalogClient";
import {
  getComediansFromDB,
  getWhatsAppOrderNumberFromDB,
} from "../../src/lib/site-config.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TalentsPage() {
  const [comedians, whatsappNumber] = await Promise.all([
    getComediansFromDB(),
    getWhatsAppOrderNumberFromDB(),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
      <Navbar />
      <TalentsCatalogClient
        comedians={comedians}
        whatsappNumber={whatsappNumber}
      />
      <Footer />
    </div>
  );
}

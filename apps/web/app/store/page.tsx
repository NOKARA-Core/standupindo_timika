import { Navbar } from "../../src/components/Navbar";
import { Footer } from "../../src/components/Footer";
import { StoreCatalogClient } from "../../src/components/StoreCatalogClient";
import {
  getMerchandiseFromDB,
  getWhatsAppOrderNumberFromDB,
} from "../../src/lib/site-config.server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StorePage() {
  const [merchandise, whatsappNumber] = await Promise.all([
    getMerchandiseFromDB(),
    getWhatsAppOrderNumberFromDB(),
  ]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col selection:bg-[#FF4500] selection:text-white">
      <Navbar />
      <StoreCatalogClient
        merchandise={merchandise}
        whatsappNumber={whatsappNumber}
      />
      <Footer />
    </div>
  );
}

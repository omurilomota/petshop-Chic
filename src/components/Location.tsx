import { BUSINESS, waLink } from "../config";
import { LineIcon, WhatsAppIcon } from "./icons";
import { SectionTitle } from "./SectionTitle";

const ICONS = {
  pin: "M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10zM12 11a2 2 0 100-4 2 2 0 000 4z",
  clock: "M12 6v6l4 2M12 22a10 10 0 100-20 10 10 0 000 20z",
  phone: "M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3 19.5 19.5 0 01-6-6 19.8 19.8 0 01-3-8.6A2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.4 2.1L8.1 9.9a16 16 0 006 6l1.5-1.2a2 2 0 012.1-.4c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z",
};

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-cream-dark bg-white p-5">
      <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-blush-soft text-rose">
        <LineIcon d={icon} className="h-5 w-5" />
      </span>
      <div className="w-full">
        <p className="font-semibold text-coffee">{title}</p>
        <div className="mt-1 text-sm text-coffee-light">{children}</div>
      </div>
    </div>
  );
}

export function Location() {
  const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(BUSINESS.mapsQuery)}&z=14&output=embed`;

  return (
    <section id="contato" className="bg-cream-dark/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="Contato"
          title="Onde estamos"
          description="Venha nos visitar ou fale com a gente pelo WhatsApp."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <InfoCard icon={ICONS.pin} title="Endereço">
              {BUSINESS.address}
            </InfoCard>

            <InfoCard icon={ICONS.clock} title="Horário de funcionamento">
              <ul className="space-y-0.5">
                {BUSINESS.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className="font-medium text-coffee">{h.time}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>

            <InfoCard icon={ICONS.phone} title="Telefone / WhatsApp">
              {BUSINESS.phoneDisplay}
            </InfoCard>

            <a
              href={waLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-rose px-7 py-4 font-semibold text-white hover:bg-rose-dark"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Falar no WhatsApp
            </a>
          </div>

          <iframe
            title="Localização da ChicPets"
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="min-h-[360px] w-full rounded-2xl border border-cream-dark"
          />
        </div>
      </div>
    </section>
  );
}

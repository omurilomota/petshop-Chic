import { BUSINESS, mapsEmbedSrc, mapsRouteLink, telLink, waLink } from "../config";
import { ICON_PATHS, LineIcon, WhatsAppIcon } from "./icons";
import { SectionTitle } from "./SectionTitle";

function InfoCard({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-cream-dark bg-white p-4 sm:p-5">
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
  const mapSrc = mapsEmbedSrc();

  return (
    <section id="contato" className="bg-cream-dark/50 py-14 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="Contato"
          title="Onde estamos"
          description="Venha nos visitar ou fale com a gente pelo WhatsApp."
        />

        <div className="mt-10 grid gap-6 sm:mt-12 sm:gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <InfoCard icon={ICON_PATHS.pin} title="Endereço">
              {BUSINESS.address}
              <a
                href={mapsRouteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex w-fit items-center gap-1.5 py-2 font-medium text-rose hover:text-rose-dark"
              >
                <LineIcon d={ICON_PATHS.route} className="h-3.5 w-3.5" />
                Ver rota no Google Maps
              </a>
            </InfoCard>

            <InfoCard icon={ICON_PATHS.clock} title="Horário de funcionamento">
              <ul className="space-y-0.5">
                {BUSINESS.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className="font-medium text-coffee">{h.time}</span>
                  </li>
                ))}
              </ul>
            </InfoCard>

            <InfoCard icon={ICON_PATHS.phone} title="Telefone / WhatsApp">
              {/* inline-block + py: alvo de toque confortável para discar no celular. */}
              <a href={telLink} className="inline-block py-1.5 font-medium text-coffee hover:text-rose">
                {BUSINESS.phoneDisplay}
              </a>
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
            className="min-h-[240px] w-full rounded-2xl border border-cream-dark sm:min-h-[360px]"
          />
        </div>
      </div>
    </section>
  );
}

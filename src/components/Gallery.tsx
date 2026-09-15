import { IMAGES } from "../config";
import { SectionTitle } from "./SectionTitle";

export function Gallery() {
  return (
    <section id="galeria" className="bg-cream-dark/50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="Galeria"
          title="Alguns dos nossos clientes"
          description="Cada pet sai daqui limpo, cheiroso e bem cuidado."
        />

        {/* As fotos são retrato (mais altas que 4/5): ancorar no topo (object-top)
            evita que o recorte corte a cabeça, os olhos ou a presilha dos pets. */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {IMAGES.gallery.map((p) => (
            <img
              key={p.alt}
              src={p.src}
              alt={p.alt}
              loading="lazy"
              className="aspect-[4/5] w-full rounded-2xl object-cover object-top"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

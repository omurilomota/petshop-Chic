import { IMAGES } from "../config";
import { SectionTitle } from "./SectionTitle";

export function Gallery() {
  return (
    <section id="galeria" className="bg-cream-dark/50 py-14 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="Galeria"
          title="Alguns dos nossos clientes"
          description="Cada pet sai daqui limpo, cheiroso e bem cuidado."
        />

        {/* No celular a galeria vira um carrossel de arrastar (scroll-snap), que
            ocupa bem menos rolagem que uma grade 2x2; a partir de sm volta a ser
            grade 2x2 e, no desktop, 4 colunas. */}
        {/* As fotos são retrato (mais altas que 4/5): ancorar no topo (object-top)
            evita que o recorte corte a cabeça, os olhos ou a presilha dos pets. */}
        <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 sm:mx-0 sm:mt-12 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4">
          {IMAGES.gallery.map((p) => (
            <img
              key={p.alt}
              src={p.src}
              alt={p.alt}
              loading="lazy"
              className="aspect-[4/5] w-[70%] flex-none snap-center rounded-2xl object-cover object-top sm:w-full"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

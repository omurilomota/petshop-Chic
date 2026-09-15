import { BUSINESS, IMAGES, waLink } from "../config";
import { WhatsAppIcon } from "./icons";

export function Hero() {
  return (
    <section id="inicio" className="pt-28 pb-16 sm:pt-36 sm:pb-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-rose">
            Petshop em {BUSINESS.city}
          </p>
          <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-coffee sm:text-5xl lg:text-6xl">
            {BUSINESS.tagline}
          </h1>
          <p className="mt-5 max-w-md text-lg text-coffee-light">
            Banho, tosa, atendimento veterinário e taxi dog, com a atenção que o seu pet merece.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={waLink("Olá! Gostaria de agendar banho e tosa na ChicPets.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-7 py-3.5 font-semibold text-white hover:bg-rose-dark"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Agendar Banho e Tosa
            </a>
            <a
              href="#servicos"
              className="inline-flex items-center justify-center rounded-full border border-coffee/25 px-7 py-3.5 font-semibold text-coffee hover:border-coffee"
            >
              Ver serviços
            </a>
          </div>
        </div>

        <img
          src={IMAGES.hero}
          alt="Cachorro de pelo longo usando óculos escuros azuis e bandana azul"
          className="aspect-[4/5] w-full rounded-3xl object-cover"
        />
      </div>
    </section>
  );
}

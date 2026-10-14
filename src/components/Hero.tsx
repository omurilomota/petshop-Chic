import { BUSINESS, IMAGES, waLink } from "../config";
import { WhatsAppIcon } from "./icons";
import { PawTrail } from "./PawDecor";

export function Hero() {
  return (
    <section id="inicio" className="relative isolate pt-24 pb-14 sm:pt-36 sm:pb-24">
      {/* Trilha de patas nas laterais livres — só em telas largas, onde não
          encosta no texto nem na foto. */}
      <PawTrail className="hidden md:block" />

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:gap-12 md:grid-cols-2">
        <div>
          {/*
            O H1 existe uma vez só por página e é o título que o Google usa
            para entender do que o site trata. Antes ele continha apenas o
            slogan, e as palavras-chave do negócio ("petshop" + a cidade)
            ficavam num <p> acima — invisíveis para a hierarquia do documento.

            Agora as duas coisas fazem parte do mesmo h1: a "sobrancelha" rosa
            virou um <span> dentro dele, com o mesmo tamanho, cor e
            espaçamento de antes. O visual não muda; o que muda é a semântica.
            O `leading-5` repete exatamente a altura de linha que o `text-sm`
            dava ao <p>, para o layout não andar um pixel.
          */}
          <h1 className="font-serif text-4xl font-bold leading-tight text-coffee sm:text-5xl lg:text-6xl">
            <span className="block font-sans text-sm font-semibold uppercase leading-5 tracking-widest text-rose">
              Petshop em {BUSINESS.city}
            </span>
            <span className="mt-4 block">{BUSINESS.tagline}</span>
          </h1>
          <p className="mt-5 max-w-md text-base text-coffee-light sm:text-lg">
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
          className="aspect-[4/5] w-full rounded-3xl object-cover object-top"
        />
      </div>
    </section>
  );
}

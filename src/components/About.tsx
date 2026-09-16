import { IMAGES } from "../config";
import { PawIcon } from "./icons";
import { SectionTitle } from "./SectionTitle";

const points = [
  "Equipe treinada e apaixonada por animais",
  "Ambiente limpo, seguro e climatizado",
  "Produtos de qualidade, adequados a cada pelagem",
  "Atendimento no ritmo do seu pet, sem estresse",
];

export function About() {
  return (
    <section id="sobre" className="py-14 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 sm:gap-12 md:grid-cols-2">
        <img
          src={IMAGES.about}
          alt="Golden retriever com bandana rosa de borboletas e presilhas no pelo"
          loading="lazy"
          className="aspect-[4/5] w-full rounded-3xl object-cover object-top"
        />

        <div>
          <SectionTitle
            eyebrow="Sobre a ChicPets"
            title="Um petshop de bairro, com cuidado de verdade"
            align="left"
          />
          <p className="mt-5 text-coffee-light">
            Atendemos Junqueirópolis e região com atenção individual a cada
            animal. Aqui o seu pet é chamado pelo nome, e a gente conhece o jeito
            de cada um.
          </p>
          <ul className="mt-7 space-y-3">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-coffee-light">
                <PawIcon className="mt-0.5 h-4 w-4 flex-none text-rose" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

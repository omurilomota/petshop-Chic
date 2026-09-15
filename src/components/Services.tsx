import { LineIcon } from "./icons";
import { SectionTitle } from "./SectionTitle";

const services = [
  {
    title: "Banho",
    desc: "Banho com produtos adequados a cada tipo de pelagem, secagem cuidadosa e perfume.",
    icon: "M7 21h10M12 3v2M8 8c0-2 2-3 4-3s4 1 4 3v8a4 4 0 01-8 0V8z",
  },
  {
    title: "Tosa",
    desc: "Tosa higiênica, na tesoura ou na máquina, respeitando o padrão de cada raça.",
    icon: "M6 9a3 3 0 100-6 3 3 0 000 6zm0 12a3 3 0 100-6 3 3 0 000 6zM20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12",
  },
  {
    title: "Consulta Veterinária",
    desc: "Atendimento clínico, vacinação e orientação para a saúde do seu animal.",
    icon: "M4.5 12.5l7.5 7.5 7.5-7.5a5 5 0 00-7.5-6.6 5 5 0 00-7.5 6.6zM9 13h2l1-2 2 4 1-2h2",
  },
  {
    title: "Taxi Dog",
    desc: "Buscamos e levamos o seu pet em casa, com segurança e conforto.",
    icon: "M3 13l2-5h14l2 5v5H3v-5zm0 0h18M7 18v2M17 18v2M7 14h.01M17 14h.01",
  },
];

export function Services() {
  return (
    <section id="servicos" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5">
        <SectionTitle
          eyebrow="Serviços"
          title="Tudo o que o seu pet precisa"
          description="Cuidado completo, do banho à saúde, em um só lugar."
        />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <article key={s.title} className="rounded-2xl border border-cream-dark bg-white p-7">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blush-soft text-rose">
                <LineIcon d={s.icon} />
              </span>
              <h3 className="mt-5 font-serif text-xl font-bold text-coffee">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-coffee-light">{s.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

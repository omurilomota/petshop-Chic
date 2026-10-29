const STEPS = [
  {
    title: "Escolha o serviço",
    text: "Banho, tosa, consulta ou taxi dog.",
  },
  {
    title: "Veja o horário",
    text: "Só aparecem horários livres de verdade.",
  },
  {
    title: "Confirme",
    text: "O horário cai direto na agenda da ChicPets.",
  },
];

export function BookingSection() {
  return (
    <section id="agendamento" className="border-y border-cream-dark/60 bg-blush-soft/35 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-5 text-center">
        <span className="text-sm font-semibold uppercase tracking-widest text-rose">Agendamento online</span>
        <h2 className="mt-3 font-serif text-3xl font-bold text-coffee sm:text-4xl">
          O horário do seu pet, confirmado na hora.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-coffee-light">
          Escolha o serviço, veja os horários livres e confirme. Leva menos de 1 minuto.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-cream-dark bg-white p-5 text-left">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-soft text-sm font-bold text-rose">
                {index + 1}
              </span>
              <p className="mt-3 font-semibold text-coffee">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-mocha">{step.text}</p>
            </div>
          ))}
        </div>

        <a
          href="#/agendar"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-rose px-7 py-3.5 font-semibold text-white hover:bg-rose-dark"
        >
          Agendar agora
        </a>
        <p className="mt-3 text-xs text-mocha">
          Demonstração com dados fictícios. O agendamento real será ativado no teste de 30 dias da ChicPets.
        </p>
      </div>
    </section>
  );
}

import { useState } from "react";
import { useDemo } from "./SupabaseDemoContext";
import { SERVICES, getAvailableSlots, getOpenMinutes, getService } from "./mockData";
import type { Appointment, PetSize, PetSpecies, ServiceId } from "./types";
import {
  MONTHS_SHORT,
  WEEKDAYS_SHORT,
  addDays,
  formatBRL,
  formatDateLong,
  formatDateShort,
  formatPhone,
  minutesToTime,
  onlyDigits,
  startOfDay,
  timeToMinutes,
  toDateKey,
} from "./format";
import { Card, DemoIcon } from "./components";
import { LineIcon, PawIcon } from "../components/icons";
import { BUSINESS, waLink } from "../config";
import { cn } from "../utils/cn";

const EMPTY_FORM = {
  clientName: "",
  phone: "",
  petName: "",
  species: "dog" as PetSpecies,
  size: "small" as PetSize,
  breed: "",
  notes: "",
  consent: false,
  needsTaxi: false,
};

type BookingForm = typeof EMPTY_FORM;

const STEPS = ["Serviço", "Dia e hora", "Seus dados"];

function buildIcs(appointment: Appointment, clientName: string, petName: string): string {
  const service = getService(appointment.serviceId);
  const endMinutes = timeToMinutes(appointment.start) + appointment.durationMin;
  const start = `${appointment.date.replace(/-/g, "")}T${appointment.start.replace(":", "")}00`;
  const end = `${appointment.date.replace(/-/g, "")}T${minutesToTime(endMinutes).replace(":", "")}00`;
  const stamp = `${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ChicPets//Agendamento//PT-BR",
    "BEGIN:VEVENT",
    `UID:${appointment.id}@chicpets.demo`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${service.name} - ${petName} na ChicPets`,
    `DESCRIPTION:Agendamento de ${clientName} para ${petName}.`,
    `LOCATION:${BUSINESS.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-mocha">{label}</span>
      <span className="text-right font-medium text-coffee">{value}</span>
    </div>
  );
}

export function Booking() {
  const { appointments, addAppointment } = useDemo();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState<ServiceId | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [form, setForm] = useState<BookingForm>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingForm, string>>>({});
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);

  const today = startOfDay(new Date());
  const dateOptions = Array.from({ length: 14 }, (_, index) => addDays(today, index))
    .filter((date) => getOpenMinutes(date) > 0)
    .filter(
      (date) =>
        !serviceId || getAvailableSlots(toDateKey(date), serviceId, appointments).length > 0,
    )
    .slice(0, 7);
  const selectedService = serviceId ? getService(serviceId) : null;

  const slots = serviceId && selectedDate && step === 2 ? getAvailableSlots(selectedDate, serviceId, appointments) : [];
  const morningSlots = slots.filter((slot) => timeToMinutes(slot) < 12 * 60);
  const afternoonSlots = slots.filter((slot) => timeToMinutes(slot) >= 12 * 60);

  const update = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const goToStep = (next: number) => {
    if (next === 2 && serviceId && !selectedDate) {
      const firstAvailable = dateOptions[0];
      if (firstAvailable) setSelectedDate(toDateKey(firstAvailable));
    }
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectService = (id: ServiceId) => {
    setServiceId(id);
    setSelectedSlot("");
    if (selectedDate && getAvailableSlots(selectedDate, id, appointments).length === 0) {
      setSelectedDate("");
    }
  };

  const selectDate = (key: string) => {
    setSelectedDate(key);
    setSelectedSlot("");
  };

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof BookingForm, string>> = {};
    if (!form.clientName.trim()) nextErrors.clientName = "Informe seu nome.";
    if (onlyDigits(form.phone).length < 10) nextErrors.phone = "Informe um WhatsApp válido com DDD.";
    if (!form.petName.trim()) nextErrors.petName = "Informe o nome do pet.";
    if (!form.consent) nextErrors.consent = "Precisamos da autorização para confirmar.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleConfirm = () => {
    if (!serviceId || !selectedDate || !selectedSlot) return;
    if (!validate()) return;
    const appointment = addAppointment({
      serviceId,
      date: selectedDate,
      start: selectedSlot,
      clientName: form.clientName.trim(),
      phone: form.phone,
      petName: form.petName.trim(),
      species: form.species,
      size: form.size,
      breed: form.breed.trim(),
      notes: form.notes.trim(),
      needsTaxi: form.needsTaxi,
    });
    setConfirmed(appointment);
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetBooking = () => {
    setStep(1);
    setServiceId(null);
    setSelectedDate("");
    setSelectedSlot("");
    setForm({ ...EMPTY_FORM });
    setErrors({});
    setConfirmed(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmedService = confirmed ? getService(confirmed.serviceId) : null;
  const icsHref =
    confirmed && confirmedService
      ? `data:text/calendar;charset=utf-8,${encodeURIComponent(
          buildIcs(confirmed, form.clientName || "Tutor", form.petName || "Pet"),
        )}`
      : "#";
  const confirmationMessage =
    confirmed && confirmedService
      ? `Olá! Acabei de agendar ${confirmedService.name} para o ${form.petName || "meu pet"} em ${formatDateShort(
          confirmed.date,
        )} às ${confirmed.start}. Meu nome é ${form.clientName || "tutor"}.`
      : "Olá! Gostaria de agendar um horário na ChicPets.";

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-cream-dark bg-white px-3.5 py-2.5 text-sm text-coffee placeholder:text-mocha/60 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20";
  const labelClass = "text-xs font-semibold uppercase tracking-wide text-mocha";

  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-cream-dark/70 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-rose text-white">
              <PawIcon className="h-5 w-5" />
            </span>
            <span className="font-serif text-xl font-bold text-coffee">
              Chic<span className="text-rose">Pets</span>
            </span>
            <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
              Demo
            </span>
          </a>
          <div className="flex flex-none items-center gap-2 sm:gap-3">
            <a href="#/" className="text-xs font-semibold text-coffee hover:text-rose">
              Voltar ao site
            </a>
            <a
              href={waLink("Olá! Prefiro agendar pelo WhatsApp.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              <DemoIcon name="chat" className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="relative overflow-hidden rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <PawIcon className="pointer-events-none absolute -right-4 -top-4 h-28 w-28 text-rose/5" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-rose">Agendamento online</p>
            <h1 className="mt-2 font-serif text-3xl font-bold leading-tight text-coffee sm:text-4xl">
              Reserve o horário do seu pet.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-coffee-light">
              Escolha o serviço, veja os horários livres e confirme. Leva menos de 1 minuto.
            </p>
            <p className="mt-2 text-[11px] text-mocha">
              Agendamento salvo no sistema. Confirmação por WhatsApp.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="p-5 sm:p-7">
            {step < 4 && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-rose sm:hidden">
                  Etapa {step} de {STEPS.length} · {STEPS[step - 1]}
                </p>
                <ol className="hidden items-center gap-2 sm:flex">
                  {STEPS.map((label, index) => {
                    const number = index + 1;
                    const active = step === number;
                    const done = step > number;
                    return (
                      <li key={label} className="flex items-center gap-2">
                        {index > 0 && (
                          <span className={cn("h-px w-6 lg:w-10", done ? "bg-rose" : "bg-cream-dark")} />
                        )}
                        <span
                          className={cn(
                            "flex h-7 w-7 flex-none items-center justify-center rounded-full text-xs font-bold",
                            active
                              ? "bg-rose text-white"
                              : done
                                ? "bg-emerald-500 text-white"
                                : "bg-cream-dark text-mocha",
                          )}
                        >
                          {done ? <DemoIcon name="check" className="h-3.5 w-3.5" /> : number}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            active ? "text-coffee" : done ? "text-emerald-700" : "text-mocha",
                          )}
                        >
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            <div className="mt-5 border-t border-cream-dark/70 pt-5">
              {step === 1 && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-coffee">Qual serviço?</h2>
                  <p className="mt-1 text-sm text-coffee-light">Escolha para ver os horários livres.</p>
                  <div className="mt-5 overflow-hidden rounded-2xl border border-cream-dark">
                    {SERVICES.map((service) => {
                      const selected = serviceId === service.id;
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => selectService(service.id)}
                          className={cn(
                            "flex w-full items-center gap-3 border-b border-cream-dark p-4 text-left transition last:border-b-0",
                            selected ? "bg-blush-soft/40" : "bg-white hover:bg-blush-soft/15",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 flex-none items-center justify-center rounded-xl",
                              selected ? "bg-rose text-white" : "bg-blush-soft text-rose",
                            )}
                          >
                            <LineIcon d={service.icon} className="h-5 w-5" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold text-coffee">{service.name}</span>
                            <span className="block text-[11px] text-mocha">{service.durationMin} min</span>
                          </span>
                          <span className="font-serif text-lg font-bold text-coffee">{formatBRL(service.price)}</span>
                          {selected && <DemoIcon name="check" className="h-4 w-4 flex-none text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      disabled={!serviceId}
                      onClick={() => goToStep(2)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continuar
                      <DemoIcon name="arrow" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && selectedService && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-coffee">Quando fica melhor?</h2>
                  <p className="mt-1 text-sm text-coffee-light">
                    Horários livres para {selectedService.name.toLowerCase()}.
                  </p>

                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-cream p-3">
                    <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white text-rose">
                      <LineIcon d={selectedService.icon} className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-coffee">{selectedService.name}</p>
                      <p className="text-[11px] text-mocha">
                        {selectedService.durationMin} min · {formatBRL(selectedService.price)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="text-xs font-semibold text-rose hover:text-rose-dark"
                    >
                      Trocar
                    </button>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-semibold uppercase tracking-widest text-mocha">Escolha o dia</p>
                    {dateOptions.length === 0 ? (
                      <div className="mt-2 rounded-xl border border-dashed border-cream-dark bg-cream/60 p-4 text-sm text-coffee-light">
                        Sem horários nos próximos dias. Fale com a ChicPets no WhatsApp.
                      </div>
                    ) : (
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {dateOptions.map((date) => {
                          const key = toDateKey(date);
                          const selected = key === selectedDate;
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => selectDate(key)}
                              className={cn(
                                "flex min-w-[68px] flex-col items-center rounded-2xl border px-3 py-2.5 text-center transition",
                                selected
                                  ? "border-rose bg-rose text-white shadow-sm"
                                  : "border-cream-dark bg-white text-coffee hover:border-rose/40",
                              )}
                            >
                              <span
                                className={cn(
                                  "text-[10px] font-semibold uppercase tracking-wide",
                                  selected ? "text-white/75" : "text-mocha",
                                )}
                              >
                                {WEEKDAYS_SHORT[date.getDay()]}
                              </span>
                              <span className={cn("mt-0.5 font-serif text-xl font-bold", selected ? "text-white" : "text-coffee")}>
                                {date.getDate()}
                              </span>
                              <span className={cn("text-[10px]", selected ? "text-white/75" : "text-mocha")}>
                                {MONTHS_SHORT[date.getMonth()]}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedDate && (
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-mocha">Horários</p>
                      {slots.length === 0 ? (
                        <div className="mt-2 rounded-xl border border-dashed border-cream-dark bg-cream/60 p-4 text-sm text-coffee-light">
                          Sem horários para este dia com esse serviço. Escolha outra data ou fale no WhatsApp.
                        </div>
                      ) : (
                        <div className="mt-2 space-y-4">
                          {morningSlots.length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-mocha">Manhã</p>
                              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                                {morningSlots.map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    className={cn(
                                      "rounded-full border px-2 py-2 text-sm font-semibold transition",
                                      selectedSlot === slot
                                        ? "border-rose bg-rose text-white"
                                        : "border-cream-dark bg-white text-coffee hover:border-rose/40 hover:text-rose",
                                    )}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {afternoonSlots.length > 0 && (
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-mocha">Tarde</p>
                              <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
                                {afternoonSlots.map((slot) => (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    className={cn(
                                      "rounded-full border px-2 py-2 text-sm font-semibold transition",
                                      selectedSlot === slot
                                        ? "border-rose bg-rose text-white"
                                        : "border-cream-dark bg-white text-coffee hover:border-rose/40 hover:text-rose",
                                    )}
                                  >
                                    {slot}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className="rounded-full border border-cream-dark px-5 py-2.5 text-sm font-semibold text-coffee hover:border-rose/40 hover:text-rose"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      disabled={!selectedSlot}
                      onClick={() => goToStep(3)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose-dark disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Continuar
                      <DemoIcon name="arrow" className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && selectedService && (
                <div>
                  <h2 className="font-serif text-2xl font-bold text-coffee">Só falta você</h2>
                  <p className="mt-1 text-sm text-coffee-light">
                    Usamos esses dados para identificar o pet e confirmar o horário.
                  </p>

                  <div className="mt-4 rounded-xl bg-cream p-3 text-sm">
                    <p className="font-semibold text-coffee">
                      {selectedService.name} · {formatDateShort(selectedDate)} às {selectedSlot}
                    </p>
                    <p className="mt-0.5 text-[11px] text-mocha">
                      {selectedService.durationMin} min · {formatBRL(selectedService.price)} · pagamento na loja
                    </p>
                  </div>

                  <form
                    className="mt-5"
                    onSubmit={(event) => {
                      event.preventDefault();
                      handleConfirm();
                    }}
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClass} htmlFor="clientName">
                          Seu nome
                        </label>
                        <input
                          id="clientName"
                          value={form.clientName}
                          onChange={(event) => update("clientName", event.target.value)}
                          placeholder="Como podemos te chamar?"
                          className={cn(inputClass, errors.clientName && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                        />
                        {errors.clientName && <p className="mt-1 text-[11px] text-red-600">{errors.clientName}</p>}
                      </div>
                      <div>
                        <label className={labelClass} htmlFor="phone">
                          WhatsApp
                        </label>
                        <input
                          id="phone"
                          inputMode="tel"
                          value={form.phone}
                          onChange={(event) => update("phone", event.target.value)}
                          onBlur={() => setForm((current) => ({ ...current, phone: formatPhone(current.phone) }))}
                          placeholder="(18) 99999-9999"
                          className={cn(inputClass, errors.phone && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                        />
                        {errors.phone && <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>}
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelClass} htmlFor="petName">
                          Nome do pet
                        </label>
                        <input
                          id="petName"
                          value={form.petName}
                          onChange={(event) => update("petName", event.target.value)}
                          placeholder="Ex.: Thor"
                          className={cn(inputClass, errors.petName && "border-red-300 focus:border-red-500 focus:ring-red-200")}
                        />
                        {errors.petName && <p className="mt-1 text-[11px] text-red-600">{errors.petName}</p>}
                      </div>
                    </div>

                    <details className="group mt-4 rounded-xl border border-cream-dark bg-cream/50">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-coffee [&::-webkit-details-marker]:hidden">
                        Detalhes do pet (opcional)
                        <DemoIcon
                          name="arrow"
                          className="h-4 w-4 flex-none text-mocha transition group-open:rotate-90"
                        />
                      </summary>
                      <div className="grid gap-4 border-t border-cream-dark px-4 py-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass} htmlFor="breed">
                            Raça
                          </label>
                          <input
                            id="breed"
                            value={form.breed}
                            onChange={(event) => update("breed", event.target.value)}
                            placeholder="Ex.: Shih Tzu"
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <span className={labelClass}>Espécie</span>
                          <div className="mt-1.5 grid grid-cols-2 gap-2">
                            {[
                              { id: "dog" as const, label: "Cão" },
                              { id: "cat" as const, label: "Gato" },
                            ].map((species) => (
                              <button
                                key={species.id}
                                type="button"
                                onClick={() => update("species", species.id)}
                                className={cn(
                                  "rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                                  form.species === species.id
                                    ? "border-rose bg-blush-soft text-rose"
                                    : "border-cream-dark bg-white text-coffee hover:border-rose/40",
                                )}
                              >
                                {species.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <span className={labelClass}>Porte</span>
                          <div className="mt-1.5 grid grid-cols-3 gap-2">
                            {[
                              { id: "small" as const, label: "Pequeno" },
                              { id: "medium" as const, label: "Médio" },
                              { id: "large" as const, label: "Grande" },
                            ].map((size) => (
                              <button
                                key={size.id}
                                type="button"
                                onClick={() => update("size", size.id)}
                                className={cn(
                                  "rounded-xl border px-2 py-2.5 text-xs font-semibold transition",
                                  form.size === size.id
                                    ? "border-rose bg-blush-soft text-rose"
                                    : "border-cream-dark bg-white text-coffee hover:border-rose/40",
                                )}
                              >
                                {size.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass} htmlFor="notes">
                            Observações
                          </label>
                          <textarea
                            id="notes"
                            rows={2}
                            value={form.notes}
                            onChange={(event) => update("notes", event.target.value)}
                            placeholder="Alergia, medo de secador ou outro detalhe?"
                            className={cn(inputClass, "resize-none")}
                          />
                        </div>
                      </div>
                    </details>

                    <div className="mt-4">
                      <label className="flex items-start gap-2 text-xs leading-relaxed text-coffee-light">
                        <input
                          type="checkbox"
                          checked={form.needsTaxi}
                          onChange={(event) => update("needsTaxi", event.target.checked)}
                          className="mt-0.5 h-4 w-4 flex-none rounded border-cream-dark text-rose focus:ring-rose"
                        />
                        <span>Precisa de taxi dog (busca e entrega pelo dono)?</span>
                      </label>
                    </div>

                    <div className="mt-4">
                      <label className="flex items-start gap-2 text-xs leading-relaxed text-coffee-light">
                        <input
                          type="checkbox"
                          checked={form.consent}
                          onChange={(event) => update("consent", event.target.checked)}
                          className="mt-0.5 h-4 w-4 flex-none rounded border-cream-dark text-rose focus:ring-rose"
                        />
                        <span>Autorizo o contato pelo WhatsApp sobre este agendamento.</span>
                      </label>
                      {errors.consent && <p className="mt-1 text-[11px] text-red-600">{errors.consent}</p>}
                    </div>

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="rounded-full border border-cream-dark px-5 py-2.5 text-sm font-semibold text-coffee hover:border-rose/40 hover:text-rose"
                      >
                        Voltar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white hover:bg-rose-dark"
                      >
                        Confirmar agendamento
                        <DemoIcon name="check" className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {step === 4 && confirmed && confirmedService && (
                <div className="text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <DemoIcon name="check" className="h-8 w-8" />
                  </span>
                  <h2 className="mt-4 font-serif text-3xl font-bold text-coffee">Agendamento confirmado!</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-coffee-light">
                    O horário já está na agenda da ChicPets. Guarde os detalhes abaixo ou adicione ao seu calendário.
                  </p>

                  <div className="mt-5 grid gap-2 text-left sm:grid-cols-2">
                    <div className="rounded-xl bg-cream p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Serviço</p>
                      <p className="mt-0.5 text-sm font-semibold text-coffee">{confirmedService.name}</p>
                      <p className="text-[11px] text-mocha">{formatBRL(confirmed.price)} · pagamento na loja</p>
                    </div>
                    <div className="rounded-xl bg-cream p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Quando</p>
                      <p className="mt-0.5 text-sm font-semibold text-coffee">
                        {formatDateShort(confirmed.date)} às {confirmed.start}
                      </p>
                      <p className="text-[11px] capitalize text-mocha">{formatDateLong(confirmed.date)}</p>
                    </div>
                    <div className="rounded-xl bg-cream p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Pet</p>
                      <p className="mt-0.5 text-sm font-semibold text-coffee">{form.petName}</p>
                      <p className="text-[11px] text-mocha">
                        {form.species === "dog" ? "Cão" : "Gato"} · {form.breed || "SRD"}
                      </p>
                    </div>
                    <div className="rounded-xl bg-cream p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Tutor</p>
                      <p className="mt-0.5 text-sm font-semibold text-coffee">{form.clientName}</p>
                      <p className="text-[11px] text-mocha">{formatPhone(form.phone)}</p>
                    </div>
                    <div className="rounded-xl bg-cream p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-mocha">Taxi dog</p>
                      <p className="mt-0.5 text-sm font-semibold text-coffee">{form.needsTaxi ? "Sim (busca e entrega)" : "Não"}</p>
                      <p className="text-[11px] text-mocha">{form.needsTaxi ? "O dono busca e leva o pet" : "Tutor traz o pet"}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    <a
                      href={icsHref}
                      download="chicpets-agendamento.ics"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-coffee px-4 py-3 text-sm font-semibold text-cream hover:bg-coffee-light"
                    >
                      <DemoIcon name="calendar" className="h-4 w-4" />
                      Adicionar ao calendário
                    </a>
                    <a
                      href={waLink(confirmationMessage)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      <DemoIcon name="chat" className="h-4 w-4" />
                      Falar no WhatsApp
                    </a>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-mocha">
                    <a href={`#/demo/agenda?data=${confirmed.date}`} className="font-semibold text-rose hover:text-rose-dark">
                      Ver na agenda do dono
                    </a>
                    <span className="text-cream-dark">·</span>
                    <button type="button" onClick={resetBooking} className="font-semibold text-coffee hover:text-rose">
                      Fazer outro agendamento
                    </button>
                  </div>

                  <p className="mt-4 text-[11px] leading-relaxed text-amber-700">
                    Agendamento salvo. Aparece na agenda do painel.
                  </p>
                </div>
              )}
            </div>
          </Card>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-rose">Seu agendamento</p>
                <DemoIcon name="calendar" className="h-4 w-4 text-rose" />
              </div>
              <div className="mt-4 space-y-2.5">
                <SummaryRow label="Serviço" value={selectedService?.name ?? "Escolha um serviço"} />
                <SummaryRow
                  label="Data"
                  value={selectedDate ? formatDateShort(selectedDate) : "Escolha o dia"}
                />
                <SummaryRow label="Horário" value={selectedSlot || "Escolha o horário"} />
                <SummaryRow
                  label="Duração"
                  value={selectedService ? `${selectedService.durationMin} min` : "—"}
                />
                <SummaryRow
                  label="Taxi dog"
                  value={form.needsTaxi ? "Sim (busca e entrega)" : "Não"}
                />
              </div>
              <div className="mt-4 flex items-end justify-between gap-3 border-t border-cream-dark pt-3">
                <span className="text-sm text-mocha">Total na loja</span>
                <span className="font-serif text-2xl font-bold text-coffee">
                  {selectedService
                    ? formatBRL(selectedService.price + (form.needsTaxi ? 30 : 0))
                    : "—"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-mocha">Pagamento na loja. Sem taxa de agendamento.</p>
            </Card>
          </aside>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl border-t border-cream-dark px-4 py-5 text-center text-[11px] text-mocha sm:px-6">
        <p>
          ChicPets · {BUSINESS.address}
        </p>
        <p className="mt-1">
          Dados fictícios para demonstração ·{" "}
          <a href="#/" className="font-semibold text-rose hover:text-rose-dark">
            Voltar ao site
          </a>
        </p>
      </footer>
    </div>
  );
}

import type {
  Appointment,
  AppointmentSource,
  AppointmentStatus,
  Client,
  Pet,
  PetSize,
  PetSpecies,
  Plan,
  PlanId,
  Service,
  ServiceId,
  Subscription,
} from "./types";
import { addDays, daysBetween, minutesToTime, parseDateKey, startOfDay, timeToMinutes, toDateKey } from "./format";

export const SLOT_MINUTES = 30;
export const CAPACITY = 2;
export const OPEN_MINUTES = 8 * 60;

export const SERVICES: Service[] = [
  {
    id: "banho",
    name: "Banho",
    shortName: "Banho",
    description: "Banho completo, secagem cuidadosa e perfume.",
    durationMin: 60,
    price: 60,
    icon: "M7 21h10M12 3v2M8 8c0-2 2-3 4-3s4 1 4 3v8a4 4 0 01-8 0V8z",
  },
  {
    id: "banho-tosa",
    name: "Banho + Tosa",
    shortName: "Banho + Tosa",
    description: "Banho completo com tosa na tesoura ou máquina.",
    durationMin: 120,
    price: 110,
    icon: "M6 9a3 3 0 100-6 3 3 0 000 6zm0 12a3 3 0 100-6 3 3 0 000 6zM20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12",
  },
  {
    id: "tosa",
    name: "Tosa",
    shortName: "Tosa",
    description: "Tosa higiênica ou completa, respeitando a raça.",
    durationMin: 90,
    price: 80,
    icon: "M6 9a3 3 0 100-6 3 3 0 000 6zm0 12a3 3 0 100-6 3 3 0 000 6zM20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12",
  },
  {
    id: "consulta",
    name: "Consulta veterinária",
    shortName: "Consulta",
    description: "Atendimento clínico, vacinação e orientação.",
    durationMin: 30,
    price: 120,
    icon: "M4.5 12.5l7.5 7.5 7.5-7.5a5 5 0 00-7.5-6.6 5 5 0 00-7.5 6.6zM9 13h2l1-2 2 4 1-2h2",
  },
  {
    id: "taxi",
    name: "Taxi dog",
    shortName: "Taxi dog",
    description: "Buscamos e levamos o seu pet em casa.",
    durationMin: 30,
    price: 30,
    icon: "M3 13l2-5h14l2 5v5H3v-5zm0 0h18M7 18v2M17 18v2M7 14h.01M17 14h.01",
  },
];

export const PLANS: Plan[] = [
  {
    id: "banho-em-dia",
    name: "Banho em Dia",
    price: 109,
    baths: 2,
    grooms: 0,
    description: "2 banhos por mês para manter o pelo em dia.",
    benefits: ["2 banhos por mês", "Prioridade na agenda", "10% off em produtos"],
  },
  {
    id: "banho-semanal",
    name: "Banho Semanal",
    price: 189,
    baths: 4,
    grooms: 0,
    description: "4 banhos por mês para quem gosta de pet sempre cheiroso.",
    benefits: ["4 banhos por mês", "Prioridade na agenda", "15% off em produtos"],
  },
  {
    id: "banho-tosa",
    name: "Banho + Tosa",
    price: 179,
    baths: 2,
    grooms: 1,
    description: "2 banhos e 1 tosa por mês, com economia no pacote.",
    benefits: ["2 banhos + 1 tosa", "Prioridade na agenda", "10% off em produtos"],
  },
];

export function getService(id: ServiceId): Service {
  const service = SERVICES.find((item) => item.id === id);
  if (!service) throw new Error(`Serviço não encontrado: ${id}`);
  return service;
}

export function getPlan(id: PlanId): Plan {
  const plan = PLANS.find((item) => item.id === id);
  if (!plan) throw new Error(`Plano não encontrado: ${id}`);
  return plan;
}

export function getOpenMinutes(date: Date): number {
  const day = date.getDay();
  if (day === 0) return 0;
  return day === 6 ? 6 * 60 : 10 * 60;
}

function getCloseMinutes(date: Date): number {
  return date.getDay() === 6 ? 14 * 60 : 18 * 60;
}

export function countOverlaps(
  appointments: Appointment[],
  dateKey: string,
  start: number,
  end: number,
): number {
  return appointments.filter((appointment) => {
    if (appointment.date !== dateKey) return false;
    if (appointment.status === "canceled" || appointment.status === "no_show") return false;
    const appointmentStart = timeToMinutes(appointment.start);
    const appointmentEnd = appointmentStart + appointment.durationMin;
    return start < appointmentEnd && end > appointmentStart;
  }).length;
}

export function getAvailableSlots(
  dateKey: string,
  serviceId: ServiceId,
  appointments: Appointment[],
): string[] {
  const date = parseDateKey(dateKey);
  if (getOpenMinutes(date) === 0) return [];

  const service = getService(serviceId);
  const close = getCloseMinutes(date);
  const now = new Date();
  const isToday = toDateKey(now) === dateKey;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slots: string[] = [];

  for (let start = OPEN_MINUTES; start + service.durationMin <= close; start += SLOT_MINUTES) {
    if (isToday && start < nowMinutes + 30) continue;
    if (countOverlaps(appointments, dateKey, start, start + service.durationMin) >= CAPACITY) continue;
    slots.push(minutesToTime(start));
  }

  return slots;
}

type Rng = () => number;

function mulberry32(seed: number): Rng {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(min: number, max: number, rng: Rng): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(items: readonly T[], rng: Rng): T {
  return items[Math.floor(rng() * items.length)];
}

function weighted<T>(items: readonly { value: T; weight: number }[], rng: Rng): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let target = rng() * total;
  for (const item of items) {
    target -= item.weight;
    if (target <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function countDayOverlaps(dayAppointments: Appointment[], start: number, end: number): number {
  return dayAppointments.filter((appointment) => {
    if (appointment.status === "canceled" || appointment.status === "no_show") return false;
    const appointmentStart = timeToMinutes(appointment.start);
    const appointmentEnd = appointmentStart + appointment.durationMin;
    return start < appointmentEnd && end > appointmentStart;
  }).length;
}

const FIRST_NAMES = [
  "Ana",
  "Beatriz",
  "Carla",
  "Daniela",
  "Eduarda",
  "Fernanda",
  "Gabriela",
  "Helena",
  "Isabela",
  "Juliana",
  "Karina",
  "Larissa",
  "Mariana",
  "Natália",
  "Olívia",
  "Patrícia",
  "Queila",
  "Renata",
  "Sofia",
  "Tatiane",
  "Ursula",
  "Vanessa",
  "Wagner",
  "Yasmin",
  "Zélia",
  "André",
  "Bruno",
  "Caio",
  "Diego",
  "Eduardo",
];

const LAST_NAMES = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Lima",
  "Pereira",
  "Ferreira",
  "Costa",
  "Rodrigues",
  "Almeida",
  "Nascimento",
  "Carvalho",
];

const NAME_COMBINATIONS = FIRST_NAMES.flatMap((first) => LAST_NAMES.map((last) => `${first} ${last}`));

const PET_NAMES = [
  "Thor",
  "Luna",
  "Mel",
  "Bob",
  "Nina",
  "Fred",
  "Bella",
  "Rex",
  "Lola",
  "Max",
  "Cacau",
  "Pandora",
  "Simba",
  "Amora",
  "Toby",
  "Jade",
  "Luke",
  "Maya",
  "Bidu",
  "Frida",
  "Pipo",
  "Kira",
  "Zeca",
  "Dora",
  "Bento",
  "Sasha",
  "Tequila",
  "Pingo",
  "Mimi",
  "Nala",
  "Brutus",
  "Pérola",
  "Snoopy",
  "Cindy",
  "Tico",
  "Lili",
  "Bono",
  "Xuxa",
  "Rocco",
  "Fumaça",
];

const DOG_BREEDS = [
  "Shih Tzu",
  "Poodle",
  "Golden Retriever",
  "Labrador",
  "Yorkshire",
  "Pinscher",
  "Maltês",
  "Bulldog Francês",
  "Spitz Alemão",
  "Border Collie",
  "SRD",
];

const CAT_BREEDS = ["Gato Persa", "Gato Siamês", "Gato SRD", "Maine Coon"];

const NOTES = [
  "Pet ansioso",
  "Alergia a shampoo",
  "Não gosta de secador",
  "Usa coleira peitoral",
  "Idoso, cuidado com as juntas",
  "Tosa na tesoura",
];

interface ClientMeta {
  firstVisitDaysAgo: number;
  frequencyDays: number;
  churnDaysAgo: number | null;
  lastVisit: string | null;
}

interface MockData {
  clients: Client[];
  appointments: Appointment[];
  subscriptions: Subscription[];
}

export function generateMockData(): MockData {
  const today = startOfDay(new Date());
  const rng = mulberry32(20261020);

  // O gerador antigo repetia o sobrenome em blocos de 30 (30 Silvas, 30
  // Santos...). Embaralhar as combinações deixa a base com cara de bairro,
  // sem mudar os números da operação.
  const nameRng = mulberry32(20261021);
  const clientNames = [...NAME_COMBINATIONS];
  for (let i = clientNames.length - 1; i > 0; i--) {
    const j = Math.floor(nameRng() * (i + 1));
    [clientNames[i], clientNames[j]] = [clientNames[j], clientNames[i]];
  }

  const clients: Client[] = [];
  const meta: ClientMeta[] = [];

  for (let i = 0; i < 300; i++) {
    const name = clientNames[i];
    const phone = `(18) 9${String(8000 + (i % 1000)).padStart(4, "0")}-${String(
      1000 + ((i * 137) % 9000),
    ).padStart(4, "0")}`;

    const firstVisitDaysAgo =
      i < 25 ? randInt(0, 30, rng) : i < 100 ? randInt(31, 90, rng) : i < 200 ? randInt(91, 180, rng) : randInt(181, 365, rng);

    const frequencyDays = weighted(
      [
        { value: 30, weight: 30 },
        { value: 35, weight: 20 },
        { value: 45, weight: 25 },
        { value: 60, weight: 15 },
        { value: 75, weight: 10 },
      ],
      rng,
    );

    const wantsChurn = i % 10 < 3 && firstVisitDaysAgo > 90;
    const churnMax = Math.min(180, firstVisitDaysAgo - 30);
    const churnDaysAgo = wantsChurn && churnMax >= 60 ? randInt(60, churnMax, rng) : null;

    const petCount = rng() < 0.2 ? 2 : 1;
    const pets: Pet[] = [];
    for (let j = 0; j < petCount; j++) {
      const species: PetSpecies = rng() < 0.15 ? "cat" : "dog";
      const size: PetSize = weighted(
        [
          { value: "small" as PetSize, weight: 40 },
          { value: "medium" as PetSize, weight: 40 },
          { value: "large" as PetSize, weight: 20 },
        ],
        rng,
      );
      pets.push({
        id: `pet-${i}-${j}`,
        name: pick(PET_NAMES, rng),
        species,
        breed: pick(species === "cat" ? CAT_BREEDS : DOG_BREEDS, rng),
        size,
      });
    }

    clients.push({
      id: `cli-${i}`,
      name,
      phone,
      pets,
      createdAt: toDateKey(addDays(today, -firstVisitDaysAgo)),
    });

    meta.push({
      firstVisitDaysAgo,
      frequencyDays,
      churnDaysAgo,
      lastVisit: null,
    });
  }

  const appointments: Appointment[] = [];
  const appointmentsByDate = new Map<string, Appointment[]>();
  let appointmentSeq = 0;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = -180; offset <= 21; offset++) {
    const date = addDays(today, offset);
    const dateKey = toDateKey(date);
    const openMinutes = getOpenMinutes(date);
    if (openMinutes === 0) continue;

    const dayAppointments = appointmentsByDate.get(dateKey) ?? [];
    const isSaturday = date.getDay() === 6;
    const target = isSaturday ? randInt(5, 8, rng) : randInt(8, 11, rng);

    for (let n = 0; n < target; n++) {
      const service = weighted<Service>(
        [
          { value: getService("banho"), weight: 55 },
          { value: getService("banho-tosa"), weight: 25 },
          { value: getService("tosa"), weight: 10 },
          { value: getService("consulta"), weight: 7 },
          { value: getService("taxi"), weight: 3 },
        ],
        rng,
      );

      const eligible: number[] = [];
      for (let i = 0; i < clients.length; i++) {
        const item = meta[i];
        if (item.firstVisitDaysAgo < -offset) continue;
        if (item.churnDaysAgo !== null && -offset < item.churnDaysAgo) continue;
        if (item.lastVisit) {
          const gap = daysBetween(parseDateKey(item.lastVisit), date);
          if (gap < Math.max(14, item.frequencyDays * 0.7)) continue;
        }
        eligible.push(i);
      }

      if (eligible.length === 0) {
        for (let i = 0; i < clients.length; i++) {
          const item = meta[i];
          if (item.firstVisitDaysAgo >= -offset && (item.churnDaysAgo === null || -offset >= item.churnDaysAgo)) {
            eligible.push(i);
          }
        }
      }
      if (eligible.length === 0) continue;

      const clientIndex = eligible[randInt(0, eligible.length - 1, rng)];
      const client = clients[clientIndex];
      const pet = pick(client.pets, rng);
      const close = getCloseMinutes(date);
      const possibleStarts: number[] = [];
      for (let start = OPEN_MINUTES; start + service.durationMin <= close; start += SLOT_MINUTES) {
        possibleStarts.push(start);
      }
      if (possibleStarts.length === 0) continue;

      let selectedStart: number | null = null;
      for (let attempt = 0; attempt < 40; attempt++) {
        const candidate = possibleStarts[randInt(0, possibleStarts.length - 1, rng)];
        if (countDayOverlaps(dayAppointments, candidate, candidate + service.durationMin) < CAPACITY) {
          selectedStart = candidate;
          break;
        }
      }
      if (selectedStart === null) continue;

      let status: AppointmentStatus;
      if (offset < 0) {
        status = weighted<AppointmentStatus>(
          [
            { value: "completed", weight: 84 },
            { value: "no_show", weight: 10 },
            { value: "canceled", weight: 6 },
          ],
          rng,
        );
      } else if (offset === 0) {
        status =
          selectedStart < nowMinutes - 15
            ? weighted<AppointmentStatus>(
                [
                  { value: "completed", weight: 84 },
                  { value: "no_show", weight: 10 },
                  { value: "canceled", weight: 6 },
                ],
                rng,
              )
            : weighted<AppointmentStatus>(
                [
                  { value: "confirmed", weight: 70 },
                  { value: "scheduled", weight: 30 },
                ],
                rng,
              );
      } else {
        status = weighted<AppointmentStatus>(
          [
            { value: "scheduled", weight: 80 },
            { value: "confirmed", weight: 15 },
            { value: "canceled", weight: 5 },
          ],
          rng,
        );
      }

      const source = weighted<AppointmentSource>(
        [
          { value: "site", weight: 30 },
          { value: "whatsapp", weight: 45 },
          { value: "manual", weight: 20 },
          { value: "referral", weight: 5 },
        ],
        rng,
      );

      const appointment: Appointment = {
        id: `apt-${appointmentSeq++}`,
        clientId: client.id,
        petId: pet.id,
        serviceId: service.id,
        date: dateKey,
        start: minutesToTime(selectedStart),
        durationMin: service.durationMin,
        price: service.price,
        status,
        source,
        notes: rng() < 0.12 ? pick(NOTES, rng) : undefined,
      };
      appointments.push(appointment);
      dayAppointments.push(appointment);
      appointmentsByDate.set(dateKey, dayAppointments);

      if (status === "completed" && (!meta[clientIndex].lastVisit || dateKey > meta[clientIndex].lastVisit)) {
        meta[clientIndex].lastVisit = dateKey;
      }
    }
  }

  appointments.sort((a, b) => (a.date === b.date ? a.start.localeCompare(b.start) : a.date.localeCompare(b.date)));

  const subscriptionClients = clients.filter((_, index) => {
    const lastVisit = meta[index].lastVisit;
    if (!lastVisit) return false;
    return daysBetween(parseDateKey(lastVisit), today) <= 90;
  });

  const subscriptions: Subscription[] = [];
  for (let i = 0; i < Math.min(30, subscriptionClients.length); i++) {
    const client = subscriptionClients[i * 2] ?? subscriptionClients[i];
    if (!client) continue;
    if (subscriptions.some((subscription) => subscription.clientId === client.id)) continue;
    const planId = weighted<PlanId>(
      [
        { value: "banho-em-dia", weight: 45 },
        { value: "banho-semanal", weight: 30 },
        { value: "banho-tosa", weight: 25 },
      ],
      rng,
    );
    subscriptions.push({
      id: `sub-${i}`,
      clientId: client.id,
      planId,
      startedAt: toDateKey(addDays(today, -randInt(20, 180, rng))),
      nextBilling: toDateKey(addDays(today, randInt(2, 30, rng))),
      status: i < 27 ? "active" : i < 29 ? "paused" : "canceled",
    });
  }

  return { clients, appointments, subscriptions };
}

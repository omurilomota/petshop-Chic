export type ServiceId = "banho" | "banho-tosa" | "tosa" | "consulta" | "taxi";

export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "no_show" | "canceled";

export type AppointmentSource = "site" | "whatsapp" | "manual" | "referral";

export type PetSpecies = "dog" | "cat";

export type PetSize = "small" | "medium" | "large";

export type PlanId = "banho-em-dia" | "banho-semanal" | "banho-tosa";

export interface Service {
  id: ServiceId;
  name: string;
  shortName: string;
  description: string;
  durationMin: number;
  price: number;
  icon: string;
}

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  size: PetSize;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  pets: Pet[];
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  petId: string;
  serviceId: ServiceId;
  date: string;
  start: string;
  durationMin: number;
  price: number;
  status: AppointmentStatus;
  source: AppointmentSource;
  notes?: string;
  needsTaxi?: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  price: number;
  baths: number;
  grooms: number;
  description: string;
  benefits: string[];
}

export interface Subscription {
  id: string;
  clientId: string;
  planId: PlanId;
  startedAt: string;
  nextBilling: string;
  status: "active" | "paused" | "canceled";
}

export interface NewAppointmentInput {
  serviceId: ServiceId;
  date: string;
  start: string;
  clientName: string;
  phone: string;
  petName: string;
  species: PetSpecies;
  size: PetSize;
  breed: string;
  notes: string;
  needsTaxi?: boolean;
}

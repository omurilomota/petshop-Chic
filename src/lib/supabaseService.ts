import { supabase } from "./supabase";

function getClient() {
  if (!supabase) throw new Error("Supabase não configurado");
  return supabase;
}
import type { Appointment, Client, Pet, ServiceId, Subscription } from "../demo/types";

interface DbClient {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  pets: DbPet[];
}

interface DbPet {
  id: string;
  client_id: string;
  name: string;
  species: "dog" | "cat";
  breed: string | null;
  size: "small" | "medium" | "large" | null;
}

interface DbAppointment {
  id: string;
  client_id: string;
  pet_id: string;
  service_id: string;
  date: string;
  start: string;
  duration_min: number;
  price: number;
  status: string;
  source: string;
  notes: string | null;
  needs_taxi: boolean;
}

interface DbSubscription {
  id: string;
  client_id: string;
  plan_id: string;
  started_at: string;
  next_billing: string;
  status: string;
}

function toClient(db: DbClient): Client {
  return {
    id: db.id,
    name: db.name,
    phone: db.phone,
    pets: (db.pets ?? []).map(toPet),
    createdAt: db.created_at,
  };
}

function toPet(db: DbPet): Pet {
  return {
    id: db.id,
    name: db.name,
    species: db.species,
    breed: db.breed ?? "SRD",
    size: db.size ?? "medium",
  };
}

function toAppointment(db: DbAppointment): Appointment {
  return {
    id: db.id,
    clientId: db.client_id,
    petId: db.pet_id,
    serviceId: db.service_id as ServiceId,
    date: db.date,
    start: db.start,
    durationMin: db.duration_min,
    price: db.price,
    status: db.status as Appointment["status"],
    source: db.source as Appointment["source"],
    notes: db.notes ?? undefined,
    needsTaxi: db.needs_taxi,
  };
}

function toSubscription(db: DbSubscription): Subscription {
  return {
    id: db.id,
    clientId: db.client_id,
    planId: db.plan_id as Subscription["planId"],
    startedAt: db.started_at,
    nextBilling: db.next_billing,
    status: db.status as Subscription["status"],
  };
}

export async function fetchClients(): Promise<Client[]> {
  const { data, error } = await getClient()
    .from("clients")
    .select("*, pets(*)")
    .order("name");

  if (error) throw new Error(`fetchClients: ${error.message}`);
  return (data as DbClient[]).map(toClient);
}

export async function fetchAppointments(date?: string): Promise<Appointment[]> {
  let query = getClient()
    .from("appointments")
    .select("*")
    .order("date")
    .order("start");

  if (date) {
    query = query.eq("date", date);
  }

  const { data, error } = await query;
  if (error) throw new Error(`fetchAppointments: ${error.message}`);
  return (data as DbAppointment[]).map(toAppointment);
}

export async function fetchSubscriptions(): Promise<Subscription[]> {
  const { data, error } = await getClient()
    .from("subscriptions")
    .select("*")
    .order("started_at", { ascending: false });

  if (error) throw new Error(`fetchSubscriptions: ${error.message}`);
  return (data as DbSubscription[]).map(toSubscription);
}

export async function createClient(name: string, phone: string): Promise<Client> {
  const id = `cli-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await getClient()
    .from("clients")
    .insert({ id, name, phone })
    .select()
    .single();

  if (error) throw new Error(`createClient: ${error.message}`);
  return toClient({ ...data, pets: [] });
}

export async function createPet(clientId: string, pet: Omit<Pet, "id">): Promise<Pet> {
  const id = `pet-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await getClient()
    .from("pets")
    .insert({
      id,
      client_id: clientId,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      size: pet.size,
    })
    .select()
    .single();

  if (error) throw new Error(`createPet: ${error.message}`);
  return toPet(data as DbPet);
}

export async function createAppointment(input: {
  clientId: string;
  petId: string;
  serviceId: string;
  date: string;
  start: string;
  durationMin: number;
  price: number;
  notes?: string;
  needsTaxi?: boolean;
}): Promise<Appointment> {
  const id = `apt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await getClient()
    .from("appointments")
    .insert({
      id,
      client_id: input.clientId,
      pet_id: input.petId,
      service_id: input.serviceId,
      date: input.date,
      start: input.start,
      duration_min: input.durationMin,
      price: input.price,
      status: "confirmed",
      source: "site",
      notes: input.notes || null,
      needs_taxi: input.needsTaxi || false,
    })
    .select()
    .single();

  if (error) throw new Error(`createAppointment: ${error.message}`);
  return toAppointment(data as DbAppointment);
}

export async function updateAppointmentStatus(
  id: string,
  status: Appointment["status"],
): Promise<void> {
  const { error } = await getClient()
    .from("appointments")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(`updateAppointmentStatus: ${error.message}`);
}

export async function createSubscription(
  clientId: string,
  planId: string,
): Promise<Subscription> {
  const today = new Date().toISOString().split("T")[0];
  const nextBilling = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const id = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { data, error } = await getClient()
    .from("subscriptions")
    .insert({
      id,
      client_id: clientId,
      plan_id: planId,
      started_at: today,
      next_billing: nextBilling,
      status: "active",
    })
    .select()
    .single();

  if (error) throw new Error(`createSubscription: ${error.message}`);
  return toSubscription(data as DbSubscription);
}

export async function recordContact(
  clientId: string,
  channel: string,
  message?: string,
  appointmentId?: string,
): Promise<void> {
  const id = `con-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const { error } = await getClient().from("contacts").insert({
    id,
    client_id: clientId,
    channel,
    message: message || null,
    appointment_id: appointmentId || null,
  });

  if (error) throw new Error(`recordContact: ${error.message}`);
}

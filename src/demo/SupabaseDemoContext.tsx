import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type {
  Appointment,
  AppointmentStatus,
  Client,
  NewAppointmentInput,
  Pet,
  PlanId,
  Subscription,
} from "./types";
import { generateMockData, getService } from "./mockData";
import { useAuth } from "./AuthContext";
import { addDays, formatPhone, onlyDigits, startOfDay, toDateKey } from "./format";
import {
  fetchClients,
  fetchAppointments,
  fetchSubscriptions,
  createClient as createClientApi,
  createPet as createPetApi,
  createAppointment as createAppointmentApi,
  updateAppointmentStatus as updateAppointmentStatusApi,
  createSubscription as createSubscriptionApi,
  recordContact as recordContactApi,
} from "../lib/supabaseService";

interface DemoContextValue {
  clients: Client[];
  appointments: Appointment[];
  subscriptions: Subscription[];
  contacted: Set<string>;
  loading: boolean;
  error: string | null;
  addAppointment: (input: NewAppointmentInput) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  addSubscription: (clientId: string, planId: PlanId) => void;
  markContacted: (clientId: string) => void;
  reset: () => void;
  refresh: () => Promise<void>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function SupabaseDemoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [contacted, setContacted] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, a, s] = await Promise.all([
        fetchClients(),
        fetchAppointments(),
        fetchSubscriptions(),
      ]);
      setClients(c);
      setAppointments(a);
      setSubscriptions(s);
    } catch (err) {
      console.warn("Supabase indisponível, usando dados mock:", err);
      const mock = generateMockData();
      setClients(mock.clients);
      setAppointments(mock.appointments);
      setSubscriptions(mock.subscriptions);
      setError(err instanceof Error ? err.message : "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      // Sem auth: usar mock data
      const mock = generateMockData();
      setClients(mock.clients);
      setAppointments(mock.appointments);
      setSubscriptions(mock.subscriptions);
      setLoading(false);
    }
  }, [user]);

  // Realtime: atualizar dados quando houver mudanças no banco
  useEffect(() => {
    if (!user) return;
    import("../lib/supabase").then(({ supabase }) => {
      if (!supabase) return;
      const channel = supabase
        .channel("demo-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
          refresh();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => {
          refresh();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions" }, () => {
          refresh();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    });
  }, [user]);

  const addAppointment = (input: NewAppointmentInput): Appointment => {
    const service = getService(input.serviceId);
    const digits = onlyDigits(input.phone);
    const existing = clients.find((client) => onlyDigits(client.phone) === digits);
    const petName = input.petName.trim();

    let client: Client;
    let pet: Pet;
    let nextClients: Client[];

    if (existing) {
      const existingPet = existing.pets.find(
        (item) => item.name.toLowerCase() === petName.toLowerCase(),
      );
      if (existingPet) {
        pet = existingPet;
        client = existing;
        nextClients = clients;
      } else {
        pet = {
          id: `pet-${Date.now()}`,
          name: petName,
          species: input.species,
          breed: input.breed.trim() || "SRD",
          size: input.size,
        };
        client = { ...existing, pets: [...existing.pets, pet] };
        nextClients = clients.map((item) => (item.id === existing.id ? client : item));
      }
    } else {
      pet = {
        id: `pet-${Date.now()}`,
        name: petName,
        species: input.species,
        breed: input.breed.trim() || "SRD",
        size: input.size,
      };
      client = {
        id: `cli-${Date.now()}`,
        name: input.clientName.trim(),
        phone: formatPhone(digits),
        pets: [pet],
        createdAt: input.date,
      };
      nextClients = [...clients, client];
    }

    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      clientId: client.id,
      petId: pet.id,
      serviceId: service.id,
      date: input.date,
      start: input.start,
      durationMin: service.durationMin,
      price: service.price + (input.needsTaxi ? getService("taxi").price : 0),
      status: "confirmed",
      source: "site",
      notes: input.notes.trim() || undefined,
      needsTaxi: input.needsTaxi,
    };

    setClients(nextClients);
    setAppointments((prev) => [...prev, appointment]);

    // Persistir no Supabase (fire and forget)
    (async () => {
      try {
        let dbClientId = client.id;
        if (!existing) {
          const dbClient = await createClientApi(client.name, client.phone);
          dbClientId = dbClient.id;
          setClients((prev) =>
            prev.map((c) => (c.id === client.id ? { ...c, id: dbClientId } : c)),
          );
        }

        let dbPetId = pet.id;
        const hasExistingPet = existing?.pets.some(
          (pp) => pp.name.toLowerCase() === petName.toLowerCase(),
        );
        if (!hasExistingPet) {
          const dbPet = await createPetApi(dbClientId, {
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            size: pet.size,
          });
          dbPetId = dbPet.id;
          setClients((prev) =>
            prev.map((c) =>
              c.id === dbClientId
                ? { ...c, pets: c.pets.map((pp) => (pp.name.toLowerCase() === petName.toLowerCase() ? { ...pp, id: dbPetId } : pp)) }
                : c,
            ),
          );
        } else {
          const foundPet = existing!.pets.find((pp) => pp.name.toLowerCase() === petName.toLowerCase());
          if (foundPet) dbPetId = foundPet.id;
        }

        const dbApt = await createAppointmentApi({
          clientId: dbClientId,
          petId: dbPetId,
          serviceId: service.id,
          date: input.date,
          start: input.start,
          durationMin: service.durationMin,
          price: service.price + (input.needsTaxi ? getService("taxi").price : 0),
          notes: input.notes.trim() || undefined,
          needsTaxi: input.needsTaxi,
        });
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointment.id ? { ...a, id: dbApt.id, clientId: dbClientId, petId: dbPetId } : a)),
        );
      } catch (err) {
        console.warn("Falha ao persistir no Supabase:", err);
      }
    })();

    return appointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === id ? { ...appointment, status } : appointment,
      ),
    );

    // Persistir
    updateAppointmentStatusApi(id, status).catch((err) =>
      console.warn("Falha ao atualizar status:", err),
    );
  };

  const addSubscription = (clientId: string, planId: PlanId) => {
    if (subscriptions.some((subscription) => subscription.clientId === clientId && subscription.status === "active")) {
      return;
    }
    const today = startOfDay(new Date());
    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      clientId,
      planId,
      startedAt: toDateKey(today),
      nextBilling: toDateKey(addDays(today, 30)),
      status: "active",
    };
    setSubscriptions((prev) => [...prev, subscription]);

    createSubscriptionApi(clientId, planId)
      .then((dbSub) => {
        setSubscriptions((prev) =>
          prev.map((s) => (s.id === subscription.id ? { ...s, id: dbSub.id } : s)),
        );
      })
      .catch((err) => console.warn("Falha ao criar assinatura:", err));
  };

  const markContacted = (clientId: string) => {
    setContacted((current) => {
      const next = new Set(current);
      next.add(clientId);
      return next;
    });
    recordContactApi(clientId, "whatsapp").catch((err) =>
      console.warn("Falha ao registrar contato:", err),
    );
  };

  const reset = () => {
    const mock = generateMockData();
    setClients(mock.clients);
    setAppointments(mock.appointments);
    setSubscriptions(mock.subscriptions);
    setContacted(new Set());
  };

  return (
    <DemoContext.Provider
      value={{
        clients,
        appointments,
        subscriptions,
        contacted,
        loading,
        error,
        addAppointment,
        updateAppointmentStatus,
        addSubscription,
        markContacted,
        reset,
        refresh,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo precisa estar dentro de DemoProvider");
  return context;
}

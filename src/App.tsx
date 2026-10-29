import { useEffect, useRef, useState } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Services } from "./components/Services";
import { BookingSection } from "./components/BookingSection";
import { Gallery } from "./components/Gallery";
import { About } from "./components/About";
import { Location } from "./components/Location";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { MobileCTABar } from "./components/MobileCTABar";
import { SupabaseDemoProvider as DemoProvider } from "./demo/SupabaseDemoContext";
import { AuthProvider } from "./demo/AuthContext";
import { useAuth } from "./demo/AuthContext";
import { Booking } from "./demo/Booking";
import { DemoApp } from "./demo/DemoApp";
import { Login } from "./demo/Login";
import { ResetPassword } from "./demo/ResetPassword";

const LANDING_TITLE = "ChicPets · Petshop & Estética Animal em Junqueirópolis";

function useHashRoute() {
  const [route, setRoute] = useState(() => window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

function Landing() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <BookingSection />
        <Gallery />
        <About />
        <Location />
      </main>
      <Footer />
      <WhatsAppButton />
      <MobileCTABar />
    </>
  );
}

function AppContent() {
  const route = useHashRoute();
  const { user, loading } = useAuth();
  const isBooking = route.startsWith("#/agendar");
  const isLogin = route.startsWith("#/login");
  const isResetPassword = route.startsWith("#/reset-password");
  const isDemo = route.startsWith("#/demo");
  const previousRoute = useRef(route);

  useEffect(() => {
    const wasAppRoute =
      previousRoute.current.startsWith("#/demo") || previousRoute.current.startsWith("#/agendar") || previousRoute.current.startsWith("#/login") || previousRoute.current.startsWith("#/reset-password");
    if (isBooking || isDemo || isLogin || isResetPassword || wasAppRoute) {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    previousRoute.current = route;
  }, [route, isBooking, isDemo, isLogin, isResetPassword]);

  useEffect(() => {
    if (route.startsWith("#/") || route === "#") return;
    const id = route.replace(/^#/, "");
    if (!id) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [route]);

  useEffect(() => {
    document.title = isDemo
      ? "Painel · ChicPets"
      : isBooking
        ? "Agendar online · ChicPets"
        : isLogin
          ? "Login · ChicPets"
          : isResetPassword
            ? "Nova senha · ChicPets"
            : LANDING_TITLE;

    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute("content", isDemo || isBooking || isLogin || isResetPassword ? "noindex, nofollow" : "index, follow");
    }
  }, [isBooking, isDemo, isLogin, isResetPassword]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-mocha">Carregando...</p>
      </div>
    );
  }

  if (isLogin) {
    return <Login />;
  }

  if (isResetPassword) {
    return <ResetPassword />;
  }

  if (isDemo && !user) {
    window.location.hash = "#/login";
    return null;
  }

  return (
    <>
      {isBooking ? <Booking /> : isDemo ? <DemoApp route={route} /> : <Landing />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DemoProvider>
        <AppContent />
      </DemoProvider>
    </AuthProvider>
  );
}

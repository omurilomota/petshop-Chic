// Dados do negócio
export const BUSINESS = {
  name: "ChicPets",
  tagline: "Cuidado e carinho para o seu melhor amigo",
  city: "Junqueirópolis - SP",
  whatsapp: "55 18 99826-5409", // 55 + DDD + número, só dígitos
  phoneDisplay: "(18) 99999-9999",
  address: "Rua Belo Horizonte, 1066 - Centro, Junqueirópolis - SP",
  hours: [
    { day: "Segunda a Sexta", time: "08h às 18h" },
    { day: "Sábado", time: "08h às 14h" },
    { day: "Domingo", time: "Fechado" },
  ],
  instagram: "@patinhachic.junq",
  mapsQuery: "Junqueirópolis SP",
};

export const WA_MESSAGE = "Olá! Gostaria de agendar um horário na ChicPets.";

export const waLink = (message = WA_MESSAGE) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;

// Fotos de banco (Pexels) para o protótipo — substituir pelas fotos da loja.
const pexels = (id: number, w = 800, h = 1000) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}&h=${h}`;

export const IMAGES = {
  hero: pexels(12283472, 900, 1100),
  about: pexels(19145899, 900, 1100),
  gallery: [
    { src: pexels(19145877), alt: "Yorkshire sendo tosado" },
    { src: pexels(6131161), alt: "Cachorro no banho" },
    { src: pexels(35710849), alt: "Gato após escovação" },
    { src: pexels(6222967), alt: "Yorkshire na banheira" },
  ],
};

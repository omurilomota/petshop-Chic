// Fotos da demonstração — arquivos em src/pictures.
// Os .webp são derivados otimizados (ffmpeg, quality 82) dos PNGs originais,
// para o build singlefile não embutir 2,8 MB em base64.
import cachorrinho1 from "./pictures/Cachorrinho-1.webp";
import cachorrinho2 from "./pictures/Cachorrinho-2.webp";
import cachorrinho3 from "./pictures/Cachorrinho-3.webp";
import cachorrinho4 from "./pictures/Cachorrinho-4.webp";
import cachorrinho5 from "./pictures/Cachorrinho-5.webp";
// O arquivo no disco está sem o "h" no nome (Cachorrino-6) — mantido como está.
import cachorrino6 from "./pictures/Cachorrino-6.webp";

// Dados do negócio
export const BUSINESS = {
  name: "ChicPets",
  tagline: "Cuidado e carinho para o seu melhor amigo",
  city: "Junqueirópolis - SP",
  whatsapp: "5518999990117", // 55 + DDD + número, só dígitos (usado no link wa.me)
  whatsappDev: "5518999990118",
  whatsappDevDisplay: "(18) 99999-0118",
  phoneDisplay: "(18) 99999-0117",
  address: "Rua dos Girassóis, 220 - Centro, Junqueirópolis - SP",
  hours: [
    { day: "Segunda a Sexta", time: "08h às 18h" },
    { day: "Sábado", time: "08h às 14h" },
    { day: "Domingo", time: "Fechado" },
  ],
  instagram: "@demonstracao",
  // Busca usada no mapa embutido e no link de rota. Aponta para o endereço
  // completo (número + bairro + cidade), não só para a cidade.
  // Se o pino cair no lugar errado, troque pelo par "latitude, longitude"
  // exato do Google Maps — ex.: "-21.51430, -51.43300".
  mapsQuery: "Rua dos Girassóis, 220 - Centro, Junqueirópolis - SP",
};

/** Mapa embutido do Google Maps apontando para o endereço exato da loja. */
export const mapsEmbedSrc = (zoom = 17) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(BUSINESS.mapsQuery)}&z=${zoom}&output=embed`;

/** Abre o Google Maps já com a rota até a loja. */
export const mapsRouteLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(BUSINESS.mapsQuery)}`;

export const WA_MESSAGE = "Olá! Gostaria de agendar um horário na ChicPets.";

export const waLink = (message = WA_MESSAGE) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(message)}`;

/** Discagem direta (`tel:`) — usado no botão "Ligar" da barra de ações do mobile. */
export const telLink = `tel:+${BUSINESS.whatsapp}`;

/** Link de WhatsApp do responsável pelo projeto (Murilo), com mensagem pronta. */
export const ownerWhatsAppLink = (message = "Olá, Murilo! Vi a proposta da ChicPets e queria conversar.") =>
  `https://wa.me/${BUSINESS.whatsappDev}?text=${encodeURIComponent(message)}`;

/** Crédito discreto exibido no rodapé. O link leva ao WhatsApp do Murilo. */
export const CREDITS = {
  name: "Murilo Mota",
  url: ownerWhatsAppLink("Olá, Murilo! Vi o site da ChicPets e queria falar com você."),
};

export const NUMBER_OWNER_SITE = {
  name: "Murilo Mota",
  whatsapp: BUSINESS.whatsappDev,
  phoneDisplay: BUSINESS.whatsappDevDisplay,
  whatsappLink: ownerWhatsAppLink,
};

/**
 * Patas caninas decorativas espalhadas pela página (trilha no hero e faixa no
 * rodapé). Troque para `false` para tirar toda a decoração do site.
 */
export const SHOW_PAW_DECOR = true;

export const IMAGES = {
  hero: cachorrinho1,
  about: cachorrinho4,
  gallery: [
    {
      src: cachorrinho2,
      alt: "Cachorro branco de pelo curto com bandana rosa estampada e presilha dourada",
    },
    {
      src: cachorrinho3,
      alt: "Cachorro pequeno de pelo branco com coroa de strass e bandana rosa",
    },
    {
      src: cachorrinho5,
      alt: "Cachorro marrom e branco com tiara de flor preta descansando o queixo nas patas",
    },
    {
      src: cachorrino6,
      alt: "Cachorro branco com manchas marrons usando bandana laranja na guia, na rua",
    },
  ],
};

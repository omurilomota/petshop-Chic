// Fotos reais da loja — arquivos em src/pictures.
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

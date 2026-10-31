const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const GIFTS = [
  // --- COTA ESPECIAL: VALOR ABERTO ---
  {
    title: "Produtor Executivo: Você Define o Orçamento da Produção!",
    description: "Quer investir o valor que o seu coração (e o seu bolso) mandar? Escolha qualquer quantia livre a partir de R$ 1 e garanta seus créditos no topo como Produtor Executivo Oficial do Casamento!",
    imageUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80",
    price: 150.0,
    category: "aberto",
  },

  // --- SOBREVIVÊNCIA DO CASAL & ILHA DE EDIÇÃO ---
  {
    title: "Café Gourmet para Madrugadas de Render no Premiere",
    description: "Combustível essencial para manter o noivo acordado enquanto o After Effects renderiza aquela timeline pesadíssima em 4K e a noiva dorme o sono dos justos.",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    price: 100.0,
    category: "sobrevivencia",
  },
  {
    title: "Rivotril Pré-Altar: 'Prometo Não Mexer no LUT do Fotógrafo'",
    description: "Dose cavalar de autocontrole para o Erick não tirar a câmera da mão do fotógrafo contratado no meio da cerimônia pra mudar o balanço de branco.",
    imageUrl: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80",
    price: 120.0,
    category: "sobrevivencia",
  },
  {
    title: "Almofada Ergonômica para a Cadeira de Montagem",
    description: "Garantindo que a coluna do editor chegue viva aos 50 anos para poder passear de mãos dadas com a esposa em vez de travar no chão.",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    price: 130.0,
    category: "sobrevivencia",
  },
  {
    title: "Terapia de Casal: Assistir Filme sem Comentar os 24fps",
    description: "Treinamento intensivo para a Itally conseguir assistir Netflix em paz sem ouvir uma palestra de 40 minutos sobre iluminação de 3 pontos e aberração cromática.",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
    price: 110.0,
    category: "sobrevivencia",
  },
  {
    title: "Fone com Cancelamento: 'Tô Mixando Áudio, Amor!'",
    description: "O álibi perfeito para escapar das DRs sobre a toalha molhada na cama fingindo que está analisando frequências sonoras ultra-críticas.",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    price: 150.0,
    category: "sobrevivencia",
  },
  {
    title: "SSD NVMe 4TB pro Noivo Não Usar o HD de Fotos da Esposa",
    description: "Prevenção de catástrofe matrimonial! Evita a trágica frase: 'Amor, tive que deletar o ensaio da família pra colocar uns B-rolls em ProRes RAW'.",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
    price: 220.0,
    category: "sobrevivencia",
  },
  {
    title: "Monitor OLED 4K 10-bit Calibrado para o Color Grading da Paz",
    description: "Cores 100% fiéis e pretos perfeitos para a noiva nunca mais dizer: 'Amor, essa foto tá esquisita' e o Erick responder que é a estética teal and orange cinematográfica.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    price: 750.0,
    category: "sobrevivencia",
  },
  {
    title: "Mac Studio M3 Ultra: O Fim das Travadas no Meio do Projeto",
    description: "Máquina potentíssima para renderizar timelines pesadas em segundos e liberar o noivo a tempo do almoço de domingo com a família da Itally.",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    price: 890.0,
    category: "sobrevivencia",
  },

  // --- SET DE GRAVAÇÃO & FESTA DOS NOIVOS ---
  {
    title: "Gaffer Tape Mágica para Remendar os Imprevistos da Festa",
    description: "A fita salvadora que conserta desde alça de vestido arrebentada até padrinho que não para de falar no microfone.",
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    price: 100.0,
    category: "festa",
  },
  {
    title: "Cota pro Noivo Não Pedir Microfone Lapela no Altar",
    description: "Evitando que o Erick interrompa o celebrante para reclamar que o áudio 'tá clipando em 0dB e captando muito ruído de fundo da nave'.",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    price: 110.0,
    category: "festa",
  },
  {
    title: "Bateria Extra (V-Mount) para os Noivos na Pista de Dança",
    description: "Energia ininterrupta para aguentar 8 horas de pista de dança sem desarmar o disjuntor nem perder o ritmo até o amanhecer.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    price: 125.0,
    category: "festa",
  },
  {
    title: "Claquete Oficial: 'Casamento Erick & Itally - Take 1, Cena 1'",
    description: "O corte definitivo na vida de solteiro! Direção de arte impecável, elenco entrosado e aplauso garantido de toda a equipe e convidados.",
    imageUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=800&q=80",
    price: 140.0,
    category: "festa",
  },
  {
    title: "Iluminação RGB Quentinha (3200K) pro Pós-Festa",
    description: "Porque clima de romance de cinema precisa de temperatura de cor ajustada no capricho e sem luz de LED fria de consultório dentário.",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    price: 150.0,
    category: "festa",
  },
  {
    title: "Energéticos & Mocktails de Frutas para Virar a Madrugada",
    description: "Rodada de drinks especiais sem álcool (frutas vermelhas, maracujá e hortelã) e energéticos para manter o elenco e padrinhos hidratados e cheios de pique.",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    price: 120.0,
    category: "festa",
  },
  {
    title: "Catering da Madrugada: Rodada de Pizzas Artesanais pro Elenco",
    description: "A clássica pizza da madrugada no set de gravação para recarregar as energias com muita muçarela, risadas e zero ressaca.",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    price: 140.0,
    category: "festa",
  },
  {
    title: "Gimbal Estabilizador 3 Eixos: Movimento de Câmera Suave na Pista",
    description: "Estabilização de nível Hollywoodiano para garantir que os vídeos da comemoração fiquem lisos como seda, mesmo pulando na pista de dança.",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    price: 650.0,
    category: "festa",
  },

  // --- LUA DE MEL & LOCAÇÕES CINEMATOGRÁFICAS ---
  {
    title: "Protetor Solar FPS 70 para Externa sem Filtro ND",
    description: "Indispensável para o noivo não virar um canal vermelho estourado em 100 IRE e passar a viagem inteira ardendo deitado de bruços.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    price: 100.0,
    category: "lua-de-mel",
  },
  {
    title: "Golden Hour Romântico sem Ficar 2 Horas Nivelando o Tripé",
    description: "Garantia contratual de que o Erick vai curtir o pôr do sol abraçado com a Itally em vez de ficar checando histograma e zebra na tela.",
    imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80",
    price: 180.0,
    category: "lua-de-mel",
  },
  {
    title: "Taxa de Excesso de Bagagem para 4 Lentes e 1 Drone",
    description: "Para a Itally não precisar deixar as malas de roupas e biquínis pra trás só porque o case Pelican das câmeras pesou 32kg no aeroporto.",
    imageUrl: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=800&q=80",
    price: 200.0,
    category: "lua-de-mel",
  },
  {
    title: "Jantar Romântico em Alta Resolução (Sem Ruído Digital)",
    description: "Uma noite inesquecível à luz de velas, com gastronomia refinada de chef, sucos artesanais, ISO nativo e foco cravado no amor dos recém-casados.",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    price: 240.0,
    category: "lua-de-mel",
  },
  {
    title: "Suíte com Enquadramento Anamórfico Vista pro Mar",
    description: "Acordar na lua de mel com enquadramento de tela de cinema em 2.39:1, vista deslumbrante pras ondas e zero compressão de felicidade.",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    price: 280.0,
    category: "lua-de-mel",
  },
  {
    title: "Drone Subaquático 4K para Filmar Corais na Lua de Mel",
    description: "Cota de alto nível! Capturar takes submersos em 4K sem o noivo precisar mergulhar segurando o ar com uma GoPro amarrada na cabeça.",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    price: 920.0,
    category: "lua-de-mel",
  },
  {
    title: "Passagem Executiva com Bagagem Ilimitada para Cases Pelican",
    description: "Para o casal viajar no maior conforto e sem o pânico de despachar lentes caras e equipamentos frágeis no porão do avião.",
    imageUrl: "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=800&q=80",
    price: 980.0,
    category: "lua-de-mel",
  },
  {
    title: "Lente Anamórfica Cine Prime dos Sonhos (Cota Master)",
    description: "O ápice do luxo cinematográfico! Flares azuis horizontais e bokeh oval característico para transformar os vídeos de família numa superprodução.",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    price: 1000.0,
    category: "lua-de-mel",
  },
];

async function run() {
  console.log("🎬 Atualizando presentes com fotos cinematográficas verificadas...");
  for (const item of GIFTS) {
    const existing = await prisma.gift.findFirst({ where: { title: item.title } });
    if (existing) {
      await prisma.gift.update({
        where: { id: existing.id },
        data: {
          imageUrl: item.imageUrl,
          description: item.description,
          price: item.price,
          category: item.category,
        },
      });
    } else {
      await prisma.gift.create({ data: item });
    }
  }
  console.log(`✅ Sucesso! Catálogo de presentes 100% atualizado.`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

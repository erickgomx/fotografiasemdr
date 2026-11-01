export interface SeedGift {
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  category: "lua-de-mel" | "festa" | "sobrevivencia" | "aberto";
}

export const INITIAL_GIFTS: SeedGift[] = [
  // --- PRESENTE ESPECIAL: VALOR ABERTO ---
  {
    title: "Produtor Executivo: Você Financia o Filme da Nossa Vida!",
    description: "Quer ser aquele padrinho ou amigo lendário que assina os créditos principais nos agradecimentos? Escolha sua contribuição de investimento e tenha seu nome eternizado no topo do mural oficial dos maiores incentivadores dessa história de amor.",
    imageUrl: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80",
    price: 197.0,
    category: "aberto",
  },

  // --- SOBREVIVÊNCIA DO CASAL & ILHA DE EDIÇÃO ---
  {
    title: "Café Gourmet para Madrugadas de Render no Premiere",
    description: "A dura verdade que ninguém conta: madrugadas intermináveis de exportação no Premiere testam qualquer casamento. Com esse café especial, você financia o combustível que mantém o Erick acordado e garante que a Itally durma em paz, acordando com o projeto finalizado e a casa em harmonia.",
    imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80",
    price: 197.0,
    category: "sobrevivencia",
  },
  {
    title: "Rivotril Pré-Altar: 'Prometo Não Mexer no LUT do Fotógrafo'",
    description: "Dose emergencial de autocontrole para o Erick não arrancar a câmera da mão do fotógrafo contratado no meio da cerimônia pra reclamar do balanço de branco. Salve o fotógrafo e a tranquilidade da noiva no altar!",
    imageUrl: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80",
    price: 215.0,
    category: "sobrevivencia",
  },
  {
    title: "Almofada Ergonômica para a Cadeira de Montagem",
    description: "Garantindo que a coluna do editor chegue viva aos 50 anos para poder passear de mãos dadas com a esposa em vez de travar no chão da sala reclamando de dor lombar após 14 horas de corte.",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80",
    price: 230.0,
    category: "sobrevivencia",
  },
  {
    title: "Terapia de Casal: Assistir Filme sem Comentar os 24fps",
    description: "Treinamento intensivo de tolerância para a Itally conseguir assistir uma comédia romântica na Netflix sem ouvir uma palestra de 45 minutos sobre iluminação de 3 pontos, profundidade de campo e aberração cromática.",
    imageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80",
    price: 245.0,
    category: "sobrevivencia",
  },
  {
    title: "Fone com Cancelamento: 'Tô Mixando Áudio, Amor!'",
    description: "O álibi perfeito de sobrevivência matrimonial! Permite escapar com classe das discussões sobre a toalha molhada na cama fingindo que está analisando frequências sonoras ultra-críticas no fone.",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
    price: 280.0,
    category: "sobrevivencia",
  },
  {
    title: "SSD NVMe 4TB pro Noivo Não Usar o HD de Fotos da Esposa",
    description: "Prevenção ativa de catástrofe conjugal! Evita a trágica frase matinal: 'Amor, tive que deletar o ensaio da sua família pra salvar uns B-rolls pesados em ProRes RAW'. Paz garantida no disco e no lar.",
    imageUrl: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80",
    price: 360.0,
    category: "sobrevivencia",
  },
  {
    title: "Monitor OLED 4K 10-bit Calibrado para o Color Grading da Paz",
    description: "Cores 100% fiéis e pretos perfeitos para a noiva nunca mais dizer: 'Amor, essa foto tá esquisita' e o Erick responder que é a estética cinematográfica de Hollywood. Cores certas, casamento blindado.",
    imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    price: 790.0,
    category: "sobrevivencia",
  },
  {
    title: "Mac Studio M3 Ultra: O Fim das Travadas no Meio do Projeto",
    description: "Poder de fogo para renderizar timelines pesadas em segundos e liberar o noivo a tempo do almoço de domingo com a família da Itally. Menos tempo na ilha de edição, mais tempo com a esposa.",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80",
    price: 1150.0,
    category: "sobrevivencia",
  },

  // --- SET DE GRAVAÇÃO & FESTA DOS NOIVOS ---
  {
    title: "Gaffer Tape Mágica para Remendar os Imprevistos da Festa",
    description: "A fita salvadora do set de filmagem que conserta absolutamente tudo: de barra de vestido descosturada a padrinho empolgado falando alto no microfone. O item mais versátil da celebração!",
    imageUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    price: 197.0,
    category: "festa",
  },
  {
    title: "Presente pro Noivo Não Pedir Microfone Lapela no Altar",
    description: "Contribuição indispensável para impedir que o Erick interrompa o celebrante durante os votos sagrados dizendo que o microfone 'tá clipando em 0dB e captando muito eco da catedral'.",
    imageUrl: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
    price: 225.0,
    category: "festa",
  },
  {
    title: "Bateria Extra (V-Mount) para os Noivos na Pista de Dança",
    description: "Energia ininterrupta de alta voltagem para aguentar 8 horas de pista de dança sem desarmar o disjuntor, mantendo o casal e os padrinhos na ferveção até o raiar do sol.",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
    price: 260.0,
    category: "festa",
  },
  {
    title: "Claquete Oficial: 'Casamento Erick & Itally - Take 1, Cena 1'",
    description: "O corte definitivo na vida de solteiro! Direção de arte impecável, elenco entrosado e a certeza de que essa nova temporada será um sucesso estrondoso de bilheteria e amor.",
    imageUrl: "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=800&q=80",
    price: 290.0,
    category: "festa",
  },
  {
    title: "Iluminação RGB Quentinha (3200K) pro Pós-Festa",
    description: "Porque o descanso dos noivos precisa de temperatura de cor aconchegante, luz difusa suave e zero iluminação fria de consultório odontológico. O clima perfeito para relaxar a dois.",
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    price: 320.0,
    category: "festa",
  },
  {
    title: "Energéticos & Mocktails de Frutas para Virar a Madrugada",
    description: "Rodada de drinks especiais sem álcool (frutas vermelhas, maracujá e hortelã) e energéticos gelados para manter o elenco e padrinhos hidratados e cheios de pique até a última música.",
    imageUrl: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    price: 250.0,
    category: "festa",
  },
  {
    title: "Catering da Madrugada: Rodada de Pizzas Artesanais pro Elenco",
    description: "A clássica pizza da madrugada no set de gravação! Massa crocante, queijo derretido e muitas risadas para repor as energias de quem dançou a noite inteira.",
    imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
    price: 275.0,
    category: "festa",
  },
  {
    title: "Gimbal Estabilizador 3 Eixos: Movimento de Câmera Suave na Pista",
    description: "Estabilização de nível cinema para garantir que os vídeos e lembranças da festa fiquem lisos como seda, mesmo com todo mundo pulando abraçado na pista de dança.",
    imageUrl: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80",
    price: 680.0,
    category: "festa",
  },

  // --- LUA DE MEL & LOCAÇÕES CINEMATOGRÁFICAS ---
  {
    title: "Protetor Solar FPS 70 para Externa sem Filtro ND",
    description: "Indispensável para o noivo não virar um canal vermelho estourado em 100 IRE de queimadura de sol e passar a lua de mel inteira ardendo deitado de bruços na cama.",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    price: 197.0,
    category: "lua-de-mel",
  },
  {
    title: "Golden Hour Romântico sem Ficar 2 Horas Nivelando o Tripé",
    description: "Garantia contratual de que o Erick vai curtir o pôr do sol abraçado com a Itally tomando um drink, em vez de ficar 40 minutos nivelando o tripé e checando histograma na tela.",
    imageUrl: "https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80",
    price: 310.0,
    category: "lua-de-mel",
  },
  {
    title: "Taxa de Excesso de Bagagem para 4 Lentes e 1 Drone",
    description: "Para a Itally não precisar deixar as malas de roupas e biquínis pra trás no aeroporto só porque o case Pelican das câmeras e drones do Erick pesou 32kg no check-in.",
    imageUrl: "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&w=800&q=80",
    price: 340.0,
    category: "lua-de-mel",
  },
  {
    title: "Jantar Romântico em Alta Resolução (Sem Ruído Digital)",
    description: "Uma noite inesquecível à luz de velas, com gastronomia refinada de chef, sabores marcantes, brinde especial e foco cravado no amor e na cumplicidade dos recém-casados.",
    imageUrl: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80",
    price: 420.0,
    category: "lua-de-mel",
  },
  {
    title: "Suíte com Enquadramento Anamórfico Vista pro Mar",
    description: "Acordar na lua de mel com enquadramento cinematográfico de tirar o fôlego em 2.39:1, vista deslumbrante pras ondas e zero compressão de felicidade a dois.",
    imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    price: 550.0,
    category: "lua-de-mel",
  },
  {
    title: "Drone Subaquático 4K para Filmar Corais na Lua de Mel",
    description: "O sonho de consumo dos cineastas! Capturar takes submersos deslumbrantes sem o noivo precisar mergulhar sem ar com uma GoPro amarrada na cabeça.",
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    price: 940.0,
    category: "lua-de-mel",
  },
  {
    title: "Passagem Executiva com Bagagem Ilimitada para Cases Pelican",
    description: "Para os noivos viajarem nas nuvens, no maior conforto, com direito a champanhe, poltronas cama e sem o pânico de despachar equipamentos frágeis no porão do avião.",
    imageUrl: "https://images.unsplash.com/photo-1540339832862-474599807836?auto=format&fit=crop&w=800&q=80",
    price: 1280.0,
    category: "lua-de-mel",
  },
  {
    title: "Lente Anamórfica Cine Prime dos Sonhos (Edição Master)",
    description: "O ápice do luxo cinematográfico! Flares azuis horizontais e bokeh oval característico para transformar os vídeos da vida a dois e futuros filhos em verdadeiras obras de arte.",
    imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
    price: 1500.0,
    category: "lua-de-mel",
  },
];

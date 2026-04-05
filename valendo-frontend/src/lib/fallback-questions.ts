import type { GeneratedQuestion } from "@/types";

function q(text: string, options: [string, string, string, string], correctIndex: number, theme: string): GeneratedQuestion {
  const ids = ["a", "b", "c", "d"];
  return {
    text,
    options: options.map((t, i) => ({ id: ids[i], text: t })),
    correctId: ids[correctIndex],
    theme,
    difficulty: "medium",
  };
}

export const FALLBACK_QUESTIONS: Record<string, GeneratedQuestion[]> = {
  Ciencia: [
    q("Qual e a formula quimica da agua?", ["CO2", "H2O", "NaCl", "O2"], 1, "Ciencia"),
    q("Quantos ossos tem o corpo humano adulto?", ["186", "206", "256", "176"], 1, "Ciencia"),
    q("Qual e o gas mais abundante na atmosfera terrestre?", ["Oxigenio", "Hidrogenio", "Nitrogenio", "CO2"], 2, "Ciencia"),
    q("Qual planeta e o maior do sistema solar?", ["Saturno", "Netuno", "Jupiter", "Urano"], 2, "Ciencia"),
    q("O que a sigla DNA significa?", ["Acido desoxirribonucleico", "Acido dinitrico", "Derivado nucleico acido", "Acido dinucleotideo"], 0, "Ciencia"),
    q("Qual e a velocidade da luz no vacuo?", ["300.000 km/s", "150.000 km/s", "500.000 km/s", "1.000.000 km/s"], 0, "Ciencia"),
  ],
  Historia: [
    q("Em que ano comecou a Segunda Guerra Mundial?", ["1935", "1939", "1941", "1945"], 1, "Historia"),
    q("Quem proclamou a independencia do Brasil?", ["Tiradentes", "D. Pedro I", "D. Pedro II", "Jose Bonifacio"], 1, "Historia"),
    q("Qual civilizacao construiu as piramides de Gize?", ["Romana", "Grega", "Egipcia", "Mesopotamica"], 2, "Historia"),
    q("Em que ano o homem pisou na Lua pela primeira vez?", ["1965", "1969", "1972", "1967"], 1, "Historia"),
    q("Qual foi a primeira capital do Brasil?", ["Rio de Janeiro", "Brasilia", "Salvador", "Recife"], 2, "Historia"),
    q("Quem foi o primeiro presidente do Brasil?", ["Getulio Vargas", "Deodoro da Fonseca", "Floriano Peixoto", "Prudente de Morais"], 1, "Historia"),
  ],
  Tecnologia: [
    q("Quem criou o Facebook?", ["Bill Gates", "Steve Jobs", "Mark Zuckerberg", "Elon Musk"], 2, "Tecnologia"),
    q("O que significa HTML?", ["HyperText Markup Language", "High Tech Modern Language", "Hyper Transfer Mode Link", "Home Tool Markup Language"], 0, "Tecnologia"),
    q("Em que ano o iPhone foi lancado?", ["2005", "2006", "2007", "2008"], 2, "Tecnologia"),
    q("Qual empresa criou o sistema Android?", ["Apple", "Google", "Microsoft", "Samsung"], 1, "Tecnologia"),
    q("O que e um algoritmo?", ["Um tipo de virus", "Sequencia de instrucoes", "Uma linguagem", "Um hardware"], 1, "Tecnologia"),
    q("Qual linguagem e mais usada para desenvolvimento web frontend?", ["Python", "Java", "JavaScript", "C++"], 2, "Tecnologia"),
  ],
  Geografia: [
    q("Qual e o maior pais do mundo em area?", ["China", "Estados Unidos", "Canada", "Russia"], 3, "Geografia"),
    q("Qual rio e o mais extenso do mundo?", ["Nilo", "Amazonas", "Yangtze", "Mississippi"], 1, "Geografia"),
    q("Qual e o continente mais populoso?", ["Africa", "Europa", "Asia", "America"], 2, "Geografia"),
    q("Qual e a capital da Australia?", ["Sydney", "Melbourne", "Canberra", "Brisbane"], 2, "Geografia"),
    q("Quantos oceanos existem na Terra?", ["3", "4", "5", "6"], 2, "Geografia"),
    q("Qual e o ponto mais alto do mundo?", ["K2", "Monte Everest", "Monte Kilimanjaro", "Monte Elbrus"], 1, "Geografia"),
  ],
  Esportes: [
    q("Quantos jogadores tem um time de futebol em campo?", ["9", "10", "11", "12"], 2, "Esportes"),
    q("Em qual pais surgiram as Olimpiadas?", ["Italia", "Grecia", "Egito", "Franca"], 1, "Esportes"),
    q("Qual e o esporte mais praticado no mundo?", ["Basquete", "Tenis", "Futebol", "Natacao"], 2, "Esportes"),
    q("Quantos sets sao necessarios para vencer um jogo de volei?", ["2", "3", "4", "5"], 1, "Esportes"),
    q("Qual pais tem mais titulos de Copa do Mundo de futebol?", ["Alemanha", "Argentina", "Italia", "Brasil"], 3, "Esportes"),
    q("Qual e a distancia de uma maratona?", ["21 km", "42 km", "35 km", "50 km"], 1, "Esportes"),
  ],
  "Cultura Pop": [
    q("Qual e o filme de maior bilheteria da historia?", ["Titanic", "Avatar", "Vingadores: Ultimato", "Star Wars"], 1, "Cultura Pop"),
    q("Quem interpretou Jack em Titanic?", ["Brad Pitt", "Leonardo DiCaprio", "Johnny Depp", "Tom Cruise"], 1, "Cultura Pop"),
    q("Qual banda lançou o album 'Abbey Road'?", ["Rolling Stones", "Pink Floyd", "Beatles", "Led Zeppelin"], 2, "Cultura Pop"),
    q("Em qual universo esta o Homem-Aranha?", ["DC", "Marvel", "Image", "Dark Horse"], 1, "Cultura Pop"),
    q("Qual e o jogo mais vendido de todos os tempos?", ["GTA V", "Minecraft", "Tetris", "Mario Bros"], 1, "Cultura Pop"),
    q("Quem cantou 'Bohemian Rhapsody'?", ["Led Zeppelin", "Queen", "Beatles", "Pink Floyd"], 1, "Cultura Pop"),
  ],
  Matematica: [
    q("Quanto e a raiz quadrada de 144?", ["10", "11", "12", "14"], 2, "Matematica"),
    q("Qual e o valor de Pi (aproximado)?", ["3.14", "2.71", "1.61", "3.41"], 0, "Matematica"),
    q("Quantos graus tem um triangulo internamente?", ["90", "180", "270", "360"], 1, "Matematica"),
    q("O que e um numero primo?", ["Divisivel por 2", "Divisivel apenas por 1 e ele mesmo", "Sempre impar", "Sempre par"], 1, "Matematica"),
    q("Quanto e 2 elevado a 10?", ["512", "1000", "1024", "2048"], 2, "Matematica"),
    q("Qual e o proximo numero primo apos 7?", ["8", "9", "10", "11"], 3, "Matematica"),
  ],
  Natureza: [
    q("Qual e o maior animal terrestre?", ["Rinoceronte", "Hipopotamo", "Elefante africano", "Girafa"], 2, "Natureza"),
    q("Qual e a flor nacional do Brasil?", ["Rosa", "Orquidea", "Ipe", "Margarida"], 2, "Natureza"),
    q("Quantas patas tem uma aranha?", ["6", "8", "10", "12"], 1, "Natureza"),
    q("Qual e o bioma que cobre a maior parte do territorio brasileiro?", ["Cerrado", "Amazonia", "Mata Atlantica", "Caatinga"], 1, "Natureza"),
    q("Qual animal e o mais rapido do mundo?", ["Leopardo", "Aguia", "Guepardo", "Falcao-peregrino"], 3, "Natureza"),
    q("Qual e o maior oceano do planeta?", ["Atlantico", "Indico", "Artico", "Pacifico"], 3, "Natureza"),
  ],
  Geral: [
    q("Qual e o idioma mais falado no mundo?", ["Espanhol", "Ingles", "Mandarim", "Hindi"], 2, "Geral"),
    q("Quantos continentes existem?", ["5", "6", "7", "8"], 2, "Geral"),
    q("Qual e a moeda do Japao?", ["Yuan", "Won", "Iene", "Ringgit"], 2, "Geral"),
    q("Qual planeta e conhecido como Estrela d'Alva?", ["Marte", "Venus", "Mercurio", "Jupiter"], 1, "Geral"),
    q("Qual instrumento tem 88 teclas?", ["Violao", "Acordeao", "Piano", "Orgao"], 2, "Geral"),
    q("Quantas cores tem o arco-iris?", ["5", "6", "7", "8"], 2, "Geral"),
  ],
};

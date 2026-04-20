export interface Sala {
  id: string
  nome: string
  tema: string
  temaId: string
  jogadores: number
  maxJogadores: number
  privada: boolean
  host: string
}

export const SALAS: Sala[] = [
  { id: 's1', nome: 'quem acerta mais', tema: 'História', temaId: 'historia', jogadores: 3, maxJogadores: 4, privada: false, host: 'leo_z' },
  { id: 's2', nome: 'Biologia prova BR', tema: 'Biologia', temaId: 'bio', jogadores: 2, maxJogadores: 6, privada: false, host: 'mari.04' },
  { id: 's3', nome: 'cálculo 1 pesado', tema: 'Matemática', temaId: 'mat', jogadores: 5, maxJogadores: 8, privada: false, host: 'andre' },
  { id: 's4', nome: 'mecânica rápida', tema: 'Física', temaId: 'fisica', jogadores: 1, maxJogadores: 2, privada: false, host: 'bia.99' },
  { id: 's5', nome: 'mapas do mundo', tema: 'Geografia', temaId: 'geo', jogadores: 4, maxJogadores: 4, privada: false, host: 'rafa_x' },
  { id: 's6', nome: 'sala da turma', tema: 'Matemática', temaId: 'mat', jogadores: 2, maxJogadores: 10, privada: true, host: 'cami.s' },
  { id: 's7', nome: 'segunda guerra', tema: 'História', temaId: 'historia', jogadores: 6, maxJogadores: 8, privada: false, host: 'julio' },
  { id: 's8', nome: 'célula animal', tema: 'Biologia', temaId: 'bio', jogadores: 3, maxJogadores: 6, privada: false, host: 'nina.p' },
]

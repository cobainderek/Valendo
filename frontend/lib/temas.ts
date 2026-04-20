export interface Tema {
  id: string
  nome: string
  icon: string
  color: string
  bg: string
  duelos: string
  sub: string
}

export const TEMAS: Tema[] = [
  { id: 'historia', nome: 'História', icon: 'sword', color: '#7C3AED', bg: '#EDE9FE', duelos: '2.1k', sub: 'Civilizações, guerras, Brasil' },
  { id: 'bio', nome: 'Biologia', icon: 'microscope', color: '#059669', bg: '#DCFCE7', duelos: '1.8k', sub: 'Células, eco, gente é bicho' },
  { id: 'geo', nome: 'Geografia', icon: 'compass', color: '#D97706', bg: '#FEF3C7', duelos: '1.2k', sub: 'Mapas, clima, população' },
  { id: 'fisica', nome: 'Física', icon: 'atom', color: '#7C3AED', bg: '#EDE9FE', duelos: '960', sub: 'Mecânica, ondas, ótica' },
  { id: 'mat', nome: 'Matemática', icon: 'ruler', color: '#DB2777', bg: '#FCE7F3', duelos: '3.4k', sub: 'Cálculo, álgebra, geometria' },
  { id: 'apostila', nome: 'Minha apostila', icon: 'folder', color: '#1B4FBE', bg: '#DBEAFE', duelos: 'novo', sub: 'IA gera questões do teu PDF' },
]

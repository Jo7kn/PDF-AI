// lib/tools.ts
//
// Registro centrale di tutti gli strumenti AI della piattaforma "AI Toolbox".
// Fonte di verità unica: la hub page (/tools), la nav e qualsiasi altra
// superficie (sidebar, ricerca, ecc.) devono leggere da qui invece di
// duplicare l'elenco dei tool altrove.

import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  PenTool,
  Code2,
  Image as ImageIcon,
  Video,
  Mic,
  Database,
  GraduationCap,
  Languages,
  Mail,
  FileSignature,
  RefreshCw,
  Bot,
} from 'lucide-react'

export type ToolStatus = 'available' | 'soon'

export interface AiTool {
  slug: string
  name: string
  tagline: string
  description: string
  features: string[]
  icon: LucideIcon
  category: string
  gradient: string // classi Tailwind complete (icona/badge), non comporre stringhe dinamicamente
  status: ToolStatus
  href: string
  requiresPaidTier?: boolean // true = richiede piano Pro o Team, vedi lib/credits.ts TIER_GATED_TOOLS
}

export const AI_TOOLS: AiTool[] = [
  {
    slug: 'pdf-ai',
    name: 'PDF AI',
    tagline: 'Chatta e analizza i tuoi PDF',
    description: 'Carica documenti, fai domande, ottieni riassunti, OCR, flashcard e quiz generati automaticamente.',
    features: ['Chat con PDF', 'OCR', 'Riassunti', 'Estrazione testo', 'Flashcard', 'Quiz'],
    icon: FileText,
    category: 'documents',
    gradient: 'from-cyan-400 to-violet-500',
    status: 'available',
    href: '/dashboard',
  },
  {
    slug: 'ai-writer',
    name: 'AI Writer',
    tagline: 'Scrivi articoli, email e blog',
    description: 'Genera, correggi e riscrivi testi per articoli, email, blog e riassunti in pochi secondi.',
    features: ['Articoli', 'Email', 'Blog', 'Riassunti', 'Correzione', 'Riscrittura'],
    icon: PenTool,
    category: 'writing',
    gradient: 'from-fuchsia-400 to-pink-500',
    status: 'available',
    href: '/tools/ai-writer',
  },
  {
    slug: 'code-ai',
    name: 'Code AI',
    tagline: 'Genera, correggi e spiega codice',
    description: 'Generazione codice, debug, refactoring, spiegazioni e conversione tra linguaggi di programmazione.',
    features: ['Generazione', 'Debug', 'Refactoring', 'Spiegazione', 'Conversione linguaggi'],
    icon: Code2,
    category: 'dev',
    gradient: 'from-emerald-400 to-teal-500',
    status: 'available',
    href: '/tools/code-ai',
  },
  {
    slug: 'image-ai',
    name: 'Image AI',
    tagline: 'Genera e modifica immagini',
    description: 'Generazione e modifica immagini, upscaling e rimozione dello sfondo con un click.',
    features: ['Generazione', 'Modifica', 'Upscaling', 'Rimozione sfondo'],
    icon: ImageIcon,
    category: 'images',
    gradient: 'from-orange-400 to-rose-500',
    status: 'available',
    href: '/tools/image-ai',
    requiresPaidTier: true,
  },
  {
    slug: 'video-ai',
    name: 'Video AI',
    tagline: 'Trascrivi e riassumi video',
    description: 'Trascrizione, riassunti, sottotitoli automatici ed estrazione capitoli dai tuoi video.',
    features: ['Trascrizione', 'Riassunto', 'Sottotitoli', 'Capitoli'],
    icon: Video,
    category: 'video',
    gradient: 'from-red-400 to-orange-500',
    status: 'soon',
    href: '#',
  },
  {
    slug: 'audio-ai',
    name: 'Audio AI',
    tagline: 'Trascrivi e sintetizza voce',
    description: 'Speech to text, text to speech e traduzione audio tra più lingue.',
    features: ['Speech to text', 'Text to speech', 'Traduzione audio'],
    icon: Mic,
    category: 'audio',
    gradient: 'from-violet-400 to-indigo-500',
    status: 'soon',
    href: '#',
  },
  {
    slug: 'data-ai',
    name: 'Data AI',
    tagline: 'Analizza CSV ed Excel',
    description: 'Analisi di CSV ed Excel con dashboard e grafici generati automaticamente dai tuoi dati.',
    features: ['Analisi CSV', 'Analisi Excel', 'Dashboard', 'Grafici'],
    icon: Database,
    category: 'data',
    gradient: 'from-sky-400 to-blue-500',
    status: 'available',
    href: '/tools/data-ai',
    requiresPaidTier: true,
  },
  {
    slug: 'study-ai',
    name: 'Study AI',
    tagline: 'Studia con un tutor AI',
    description: 'Flashcard, quiz, tutor AI personalizzato e piani di studio su misura per i tuoi obiettivi.',
    features: ['Flashcard', 'Quiz', 'Tutor AI', 'Piano di studio'],
    icon: GraduationCap,
    category: 'study',
    gradient: 'from-amber-400 to-yellow-500',
    status: 'available',
    href: '/tools/study-ai',
    requiresPaidTier: true,
  },
  {
    slug: 'translator-ai',
    name: 'Translator AI',
    tagline: 'Traduci documenti e testi',
    description: 'Traduzione di documenti e testi mantenendo la formattazione originale.',
    features: ['Traduzione documenti', 'Traduzione testi', 'Formato preservato'],
    icon: Languages,
    category: 'translation',
    gradient: 'from-teal-400 to-cyan-500',
    status: 'available',
    href: '/tools/translator-ai',
  },
  {
    slug: 'email-ai',
    name: 'Email AI',
    tagline: 'Scrivi e rispondi alle email',
    description: 'Generazione email, risposte automatiche e miglioramento dei testi esistenti.',
    features: ['Generazione email', 'Risposte automatiche', 'Miglioramento testi'],
    icon: Mail,
    category: 'productivity',
    gradient: 'from-blue-400 to-cyan-500',
    status: 'available',
    href: '/tools/email-ai',
  },
  {
    slug: 'contract-ai',
    name: 'Contract AI',
    tagline: 'Analizza contratti e clausole',
    description: 'Analisi contratti, individuazione clausole a rischio e riassunti automatici.',
    features: ['Analisi contratti', 'Individuazione clausole', 'Riassunti', 'Rischi'],
    icon: FileSignature,
    category: 'legal',
    gradient: 'from-slate-400 to-zinc-500',
    status: 'available',
    href: '/tools/contract-ai',
    requiresPaidTier: true,
  },
  {
    slug: 'file-converter',
    name: 'File Converter',
    tagline: 'Converti tra formati file',
    description: 'Conversione tra PDF, immagini, CSV, JSON e Markdown (Word/Excel/PowerPoint in arrivo).',
    features: ['PDF → Testo', 'Immagini', 'CSV ⇄ JSON', 'Markdown ⇄ HTML'],
    icon: RefreshCw,
    category: 'productivity',
    gradient: 'from-lime-400 to-emerald-500',
    status: 'available',
    href: '/tools/file-converter',
  },
  {
    slug: 'chat-ai',
    name: 'Chat AI',
    tagline: 'Assistente AI generico',
    description: 'Conversazione libera con un assistente AI, senza documenti o contesto collegato.',
    features: ['Chat multi-turno', 'Nessun documento richiesto', 'Risposte in Markdown'],
    icon: Bot,
    category: 'chat',
    gradient: 'from-violet-400 to-fuchsia-500',
    status: 'available',
    href: '/tools/chat-ai',
  },
]

export function getToolBySlug(slug: string): AiTool | undefined {
  return AI_TOOLS.find((tool) => tool.slug === slug)
}

export const AI_TOOL_CATEGORIES: string[] = Array.from(
  new Set(AI_TOOLS.map((tool) => tool.category)),
)

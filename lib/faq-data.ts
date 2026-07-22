// lib/faq-data.ts
//
// Contenuto FAQ per le pagine tool: unica fonte sia per la sezione visibile
// in page.tsx sia per lo schema FAQPage in layout.tsx, così lo structured
// data non descrive mai qualcosa che l'utente non vede davvero sulla
// pagina (Google penalizza questa discrepanza).

export interface FaqItem {
  question: string
  answer: string
}

export const TOOL_FAQS: Record<string, FaqItem[]> = {
  'ai-writer': [
    { question: 'AI Writer scrive in italiano?', answer: 'Sì, genera e corregge testi in italiano con un tono naturale e professionale.' },
    { question: 'Posso usarlo per riscrivere un testo già esistente?', answer: 'Sì, incolla il testo e AI Writer lo corregge o lo riscrive mantenendo il significato.' },
    { question: 'Serve esperienza di copywriting per usarlo?', answer: 'No, basta descrivere cosa vuoi scrivere: AI Writer genera una bozza pronta da modificare.' },
  ],
  'code-ai': [
    { question: 'Quali linguaggi di programmazione supporta Code AI?', answer: 'I principali linguaggi come Python, JavaScript, TypeScript, Java e molti altri.' },
    { question: 'Code AI spiega il codice generato?', answer: 'Sì, ogni suggerimento include una spiegazione chiara di come e perché funziona.' },
    { question: 'Posso convertire codice da un linguaggio a un altro?', answer: 'Sì, Code AI converte snippet e funzioni tra i linguaggi più usati.' },
  ],
  'image-ai': [
    { question: 'Image AI è disponibile nel piano Free?', answer: 'No, Image AI è disponibile a partire dal piano Pro.' },
    { question: 'Posso rimuovere lo sfondo da una foto esistente?', answer: 'Sì, la rimozione sfondo è una delle funzioni incluse in Image AI.' },
    { question: 'Posso aumentare la risoluzione di un’immagine?', answer: 'Sì, l’upscaling AI migliora la qualità e la risoluzione delle tue immagini.' },
  ],
  'data-ai': [
    { question: 'Data AI è disponibile nel piano Free?', answer: 'No, Data AI è disponibile a partire dal piano Pro.' },
    { question: 'Che tipo di file posso analizzare?', answer: 'Puoi caricare file CSV ed Excel per generare analisi e visualizzazioni.' },
    { question: 'Devo saper scrivere formule o codice?', answer: 'No, Data AI genera dashboard e grafici automaticamente, senza formule.' },
  ],
  'study-ai': [
    { question: 'Study AI è disponibile nel piano Free?', answer: 'No, Study AI è disponibile a partire dal piano Pro.' },
    { question: 'Posso generare flashcard dai miei appunti?', answer: 'Sì, carica i tuoi materiali e Study AI genera flashcard e quiz automaticamente.' },
    { question: 'Il tutor AI risponde a qualsiasi materia?', answer: 'Sì, il tutor AI si adatta all’argomento e al materiale che carichi.' },
  ],
  'translator-ai': [
    { question: 'Translator AI mantiene la formattazione del documento?', answer: 'Sì, la struttura e il layout originali vengono preservati dopo la traduzione.' },
    { question: 'Quali lingue supporta?', answer: 'Le principali lingue europee e internazionali, incluso l’italiano.' },
    { question: 'Translator AI è incluso nel piano Free?', answer: 'Sì, puoi iniziare a tradurre documenti e testi già con il piano Free.' },
  ],
  'email-ai': [
    { question: 'Email AI scrive anche risposte automatiche?', answer: 'Sì, propone risposte coerenti con il contesto della conversazione ricevuta.' },
    { question: 'Posso migliorare un’email che ho già scritto?', answer: 'Sì, incolla il testo ed Email AI lo rende più chiaro e professionale.' },
    { question: 'Email AI è incluso nel piano Free?', answer: 'Sì, è disponibile fin dal piano Free con 50 crediti al mese.' },
  ],
  'contract-ai': [
    { question: 'Contract AI è disponibile nel piano Free?', answer: 'No, Contract AI è disponibile a partire dal piano Pro.' },
    { question: 'Contract AI sostituisce un avvocato?', answer: 'No, è uno strumento di supporto: non sostituisce un parere legale professionale.' },
    { question: 'Che tipo di contratti può analizzare?', answer: 'Contratti commerciali, di locazione, di lavoro e altri documenti legali comuni.' },
  ],
  'file-converter': [
    { question: 'Quali formati posso convertire oggi?', answer: 'PDF, immagini, CSV, JSON e Markdown, con Word, Excel e PowerPoint in arrivo.' },
    { question: 'File Converter è incluso nel piano Free?', answer: 'Sì, puoi iniziare a convertire file già con il piano Free.' },
    { question: 'Le conversioni mantengono la struttura dei dati?', answer: 'Sì, ad esempio le conversioni CSV ⇄ JSON preservano la struttura originale.' },
  ],
  'chat-ai': [
    { question: 'Chat AI è davvero sempre gratis?', answer: 'Sì, Chat AI è gratuito su tutti i piani, senza limiti di accesso.' },
    { question: 'Devo caricare un documento per usarlo?', answer: 'No, Chat AI funziona in conversazione libera, senza documenti richiesti.' },
    { question: 'Le risposte sono formattate in Markdown?', answer: 'Sì, ricevi risposte ben strutturate, con elenchi, codice e titoli quando serve.' },
  ],
}

export function buildFaqSchema(slug: string) {
  const faqs = TOOL_FAQS[slug]
  if (!faqs) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

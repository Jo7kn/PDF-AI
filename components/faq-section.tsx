// components/faq-section.tsx
//
// Stesso contenuto di lib/faq-data.ts usato per lo schema FAQPage nei
// layout.tsx dei tool — mai far divergere ciò che è marcato come dato
// strutturato da ciò che l'utente vede davvero in pagina.

import { TOOL_FAQS } from '@/lib/faq-data'

export function FaqSection({ slug }: { slug: string }) {
  const faqs = TOOL_FAQS[slug]
  if (!faqs) return null

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
      <h2 className="mb-4 text-lg font-semibold text-white">Domande frequenti</h2>
      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question}>
            <p className="mb-1 text-sm font-medium text-white">{faq.question}</p>
            <p className="text-sm text-slate-400">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

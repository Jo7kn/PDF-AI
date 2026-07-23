import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { LandingFooter } from '@/components/landing-footer'
import { CONTACT_EMAIL, SITE_NAME } from '@/lib/seo'

const LAST_UPDATED = '23 luglio 2026'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.16),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <LandingHeader />

      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="animate-fade-in-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Termini e condizioni</p>
          <h1 className="mb-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Termini e condizioni di utilizzo
          </h1>
          <p className="mb-12 text-sm text-slate-500">Ultimo aggiornamento: {LAST_UPDATED}</p>
        </div>

        <div className="animate-fade-in-up space-y-10 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_p]:text-slate-300 [&_p]:leading-relaxed [&_li]:text-slate-300 [&_li]:leading-relaxed [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
          <section>
            <h2>1. Chi siamo e accettazione dei termini</h2>
            <p>
              {SITE_NAME} è un servizio online che offre una suite di strumenti basati su intelligenza artificiale
              (chat sui documenti, scrittura, codice, immagini, analisi dati, analisi contratti, traduzione e
              conversione file), raggiungibile su {SITE_NAME.toLowerCase().replace(/\s+/g, '')}.it. Creando un
              account o utilizzando il servizio accetti questi termini nella loro interezza. Se non li accetti, non
              puoi utilizzare {SITE_NAME}.
            </p>
          </section>

          <section>
            <h2>2. Account</h2>
            <p>
              Per usare {SITE_NAME} serve un account, creato via email e password oppure tramite login Google. Sei
              responsabile della sicurezza delle tue credenziali e di tutta l'attività svolta dal tuo account. Devi
              avere almeno 16 anni per registrarti. Le informazioni fornite in fase di registrazione devono essere
              accurate; ci riserviamo il diritto di sospendere account con dati palesemente falsi o creati per abuso
              del servizio (es. aggirare i limiti del piano Free con account multipli).
            </p>
          </section>

          <section>
            <h2>3. Piani, crediti e fatturazione</h2>
            <p>
              {SITE_NAME} offre tre piani: <strong className="text-white">Free</strong> (gratuito, 50 crediti AI al
              mese), <strong className="text-white">Pro</strong> (a pagamento, 1000 crediti AI al mese) e{' '}
              <strong className="text-white">Team</strong> (a pagamento, 3000 crediti AI al mese, condivisione
              progetti). I crediti si consumano usando gli strumenti AI e si rinnovano a ogni ciclo di
              fatturazione; i crediti non utilizzati non si accumulano da un mese all'altro. I piani a pagamento
              includono inoltre un limite di pagine/progetti attivi, indicato nella pagina{' '}
              <Link href="/pricing" className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                Prezzi
              </Link>
              .
            </p>
            <p>
              I pagamenti sono gestiti da Stripe; non memorizziamo i dati della tua carta. Gli abbonamenti si
              rinnovano automaticamente a ogni scadenza fino a disdetta. Puoi annullare il rinnovo in qualsiasi
              momento dalla sezione Fatturazione della dashboard: continuerai ad avere accesso al piano a pagamento
              fino alla fine del periodo già pagato, dopodiché l'account torna al piano Free. Non offriamo rimborsi
              per periodi di fatturazione già iniziati, salvo obblighi di legge inderogabili nel tuo paese.
            </p>
          </section>

          <section>
            <h2>4. Uso consentito</h2>
            <p>Utilizzando {SITE_NAME} accetti di non:</p>
            <ul>
              <li>Caricare o generare contenuti illegali, diffamatori, che violano diritti d'autore di terzi o dati personali altrui senza consenso;</li>
              <li>Usare il servizio per generare spam, phishing, malware o contenuti ingannevoli su larga scala;</li>
              <li>Tentare di aggirare i limiti di credito, i controlli di accesso o le misure di sicurezza del servizio;</li>
              <li>Rivendere o redistribuire l'accesso al servizio senza autorizzazione scritta;</li>
              <li>Usare bot o scraping automatizzato per estrarre dati dal servizio al di fuori delle API previste.</li>
            </ul>
            <p>La violazione di questi punti può portare alla sospensione o chiusura dell'account, senza rimborso.</p>
          </section>

          <section>
            <h2>5. Contenuti generati dall'intelligenza artificiale</h2>
            <p>
              I contenuti prodotti dagli strumenti AI (testi, codice, immagini, analisi, traduzioni) sono generati
              automaticamente da modelli di linguaggio e possono contenere errori, imprecisioni o informazioni non
              aggiornate. Sei responsabile di verificare l'accuratezza di ogni output prima di usarlo, specialmente
              per decisioni importanti. In particolare, le analisi prodotte da Contract AI hanno scopo puramente
              informativo e <strong className="text-white">non costituiscono consulenza legale</strong>: per
              decisioni contrattuali vincolanti rivolgiti a un professionista qualificato.
            </p>
          </section>

          <section>
            <h2>6. Proprietà dei contenuti</h2>
            <p>
              I documenti che carichi restano di tua proprietà. Nei limiti di quanto concesso dai fornitori dei
              modelli AI sottostanti, i contenuti che generi tramite {SITE_NAME} sono tuoi e puoi usarli liberamente,
              incluso per scopi commerciali. Non rivendichiamo alcun diritto sui tuoi documenti o sui contenuti
              generati; li trattiamo secondo la nostra gestione dei dati descritta al punto successivo.
            </p>
          </section>

          <section>
            <h2>7. Dati e privacy</h2>
            <p>
              I documenti caricati e i dati del tuo account sono conservati su infrastruttura Supabase e usati
              esclusivamente per fornirti il servizio (elaborazione dei tuoi documenti, cronologia, fatturazione).
              Non vendiamo i tuoi dati a terzi. Alcune elaborazioni AI vengono inoltrate a fornitori di modelli
              linguistici terzi (es. NVIDIA) al solo scopo di generare la risposta richiesta. Puoi richiedere
              l'esportazione o la cancellazione dei tuoi dati scrivendo a{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>

          <section>
            <h2>8. Disponibilità del servizio</h2>
            <p>
              Ci impegniamo a mantenere {SITE_NAME} disponibile e funzionante, ma non garantiamo un uptime del
              100%: possono verificarsi interruzioni per manutenzione, problemi tecnici o indisponibilità dei
              fornitori terzi di cui ci serviamo (hosting, modelli AI, pagamenti). {SITE_NAME} è un progetto in fase
              di lancio: alcune funzionalità possono essere modificate, sospese o rimosse con breve preavviso.
            </p>
          </section>

          <section>
            <h2>9. Limitazione di responsabilità</h2>
            <p>
              Nei limiti massimi consentiti dalla legge, {SITE_NAME} viene fornito "così com'è", senza garanzie di
              alcun tipo. Non siamo responsabili per danni indiretti, perdita di dati o mancato guadagno derivanti
              dall'uso del servizio o dall'affidamento su contenuti generati dall'AI. La nostra responsabilità
              complessiva verso di te, per qualsiasi motivo, è comunque limitata all'importo che hai pagato per il
              servizio negli ultimi 12 mesi.
            </p>
          </section>

          <section>
            <h2>10. Sospensione e chiusura dell'account</h2>
            <p>
              Puoi chiudere il tuo account in qualsiasi momento dalla dashboard. Possiamo sospendere o chiudere un
              account che viola questi termini, previo tentativo di contatto salvo i casi di abuso grave o rischio
              per la sicurezza del servizio, nel qual caso la sospensione può essere immediata.
            </p>
          </section>

          <section>
            <h2>11. Modifiche ai termini</h2>
            <p>
              Possiamo aggiornare questi termini nel tempo, ad esempio per riflettere nuove funzionalità o requisiti
              legali. In caso di modifiche rilevanti aggiorneremo la data in cima a questa pagina; l'uso continuato
              del servizio dopo una modifica costituisce accettazione dei nuovi termini.
            </p>
          </section>

          <section>
            <h2>12. Legge applicabile</h2>
            <p>
              Questi termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il foro del
              consumatore secondo le norme applicabili, se sei un consumatore residente in UE.
            </p>
          </section>

          <section>
            <h2>13. Contatti</h2>
            <p>
              Per domande su questi termini scrivi a{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </section>

      <LandingFooter />
    </main>
  )
}

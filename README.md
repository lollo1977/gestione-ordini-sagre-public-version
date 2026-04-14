# 🐺 Gestione Ordini Sagra - by Luna Wolfie 

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Licenza](https://img.shields.io/badge/Licenza-Proprietaria-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

**Gestione Ordini Sagra** è l'applicazione definitiva per semplificare la presa degli ordini e la gestione della cassa durante sagre, festival ed eventi gastronomici. Sviluppata per essere veloce, intuitiva e affidabile, permette una comunicazione in tempo reale tra più casse e la cucina.

---

## ✨ Caratteristiche Principali

* 🚀 **Velocità Estrema:** Interfaccia ottimizzata per non far perdere tempo alla cassa.
* 📱 **Multi-dispositivo:** Funziona su PC, Tablet e Smartphone via browser.
* 🔗 **WebSocket Real-time:** Gli ordini arrivano in cucina istantaneamente e si sincronizzano tra tutte le casse.
* 🏪 **N Casse Configurabili:** Configura quante casse servono (1–10) dal wizard iniziale o dalle impostazioni. Ogni cassa vede in tempo reale quali altre sono attive.
* 📶 **Indicatore di Connessione:** Ogni cassa mostra un badge verde/rosso per sapere sempre se la sincronizzazione è attiva.
* 📊 **Riepilogo Totali:** Gestione automatica dei conti, delle quantità e del resto per pagamenti in contanti.
* 🖨️ **Stampa Scontrini:** Formattazione pronta per stampanti termiche (58mm, 80mm) con scontrino cucina e cliente separati.
* 🧙 **Wizard di Configurazione:** Procedura guidata al primo avvio per configurare evento, casse, menu e piano di licenza.
* 💾 **Integrità Dati:** Creazione ordini con transazione atomica — nessun ordine incompleto in caso di errore.

---

## 🛠️ Stack Tecnologico

Il progetto è costruito con le migliori tecnologie web moderne per garantire stabilità e reattività:

* **Backend:** ![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) - Motore JavaScript lato server veloce e scalabile.
* **Linguaggio:** ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) - Per un codice robusto e privo di errori logici, sia frontend che backend.
* **Frontend:** ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) - UI componente-based con TanStack Query per la gestione dello stato server.
* **Styling:** ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) + shadcn/ui - Design moderno, responsive e completamente tematizzabile.
* **Database:** ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white) con Drizzle ORM - Persistenza dati affidabile e tipizzata.
* **Comunicazione:** ![WebSockets](https://img.shields.io/badge/WebSockets-010101?style=flat&logo=socketdotio&logoColor=white) - Sincronizzazione istantanea tra tutte le casse senza ricaricare la pagina.

---

## 📜 Licenza e Modalità d'Uso

Il software è rilasciato sotto **Licenza Proprietaria "Luna Wolfie" v2.1**. L'utilizzo del software implica l'accettazione integrale della licenza.

### 🆓 Versione Free (No-Profit)
L'uso è gratuito esclusivamente per:
* Organizzazioni No-Profit e piccoli comitati di volontariato.
* Scopi personali o didattici.
* **Nota:** È vietato rimuovere la dicitura *"Realizzato da Luna Wolfie"* dagli scontrini.

### 💎 Versione PRO (Commerciale)
Obbligatoria per eventi a scopo di lucro, grandi sagre o attività commerciali.
* **Costo:** 5,00 € una tantum.
* **Vantaggi:** Codice di attivazione per funzioni avanzate, possibilità di rimuovere/modificare i crediti sugli scontrini, supporto prioritario.
* **Pagamento:** PayPal, Bonifico o concordato via email.

---

## 🛠️ Come Iniziare

1.  **Registrazione:** Prima di iniziare, invia una mail di registrazione a **bibocchia05@gmail.com** (necessaria per assistenza e attivazione PRO).
2.  **Installazione:** Il software può essere caricato su servizi cloud come **Render** (consigliato, gratuito) oppure eseguito localmente. Trovi la guida completa al deploy su Render qui sotto.
3.  **Configurazione:** Al primo avvio il wizard guida l'utente in 4 passaggi: nome evento, numero casse, menu iniziale e piano di licenza.

---

## 🚀 Guida al Deploy su Render

### Prerequisiti
- [Node.js](https://nodejs.org) installato sul tuo computer (versione 18 o superiore)
- [Git](https://git-scm.com) installato sul tuo computer (necessario per caricare il progetto su GitHub)
- Un account [GitHub](https://github.com) e [Render](https://render.com)

### 1. Scarica il progetto
Clona o scarica il progetto da GitHub sul tuo computer:
```bash
git clone https://github.com/TUO_UTENTE/TUA_REPO.git
cd TUA_REPO
```

### 2. Configura il nome del tuo evento
Il progetto include già lo script `scripts/setup-render.js` — eseguilo e inserisci il nome della tua sagra/evento quando richiesto:
```bash
node scripts/setup-render.js
```
Lo script chiederà il nome dell'evento e aggiornerà automaticamente il file `render.yaml` con i nomi corretti per il deploy.

### 3. Fai il push su GitHub
Salva le modifiche e caricale su GitHub:
```bash
git add render.yaml
git commit -m "Configurazione per [Nome Evento]"
git push
```

### 4. Deploy su Render
1. Vai su [render.com](https://render.com) e accedi
2. Clicca su **New + → Blueprint**
3. Collega la tua repository GitHub
4. Render creerà automaticamente il **database** e il **servizio web**
5. Dopo circa 5-8 minuti l'app sarà online all'indirizzo:
   ```
   https://nome-evento-pos.onrender.com
   ```

### 5. Primo accesso
Al primo avvio l'app mostra una procedura guidata per configurare:
- Nome evento e località
- Numero di casse (da 1 a 10, modificabile in seguito)
- Costo coperto e metodi di pagamento accettati
- Menu e prezzi iniziali
- Piano di licenza (Free o PRO)

---

## 💡 Note sul Piano Gratuito di Render
- Il servizio gratuito va in **"sleep"** dopo 15 minuti di inattività
- Al primo accesso dopo lo sleep impiega ~30-60 secondi a risvegliarsi
- I **dati nel database rimangono sempre**, anche durante lo sleep
- Per un servizio sempre attivo è necessario il piano a pagamento (~$7/mese)

---

## 📞 Supporto e Personalizzazioni

Hai bisogno di una funzione specifica? Vuoi un'app su misura per la tua sagra?
* **Bugfix & Sicurezza:** Supporto gratuito per tutti gli utenti registrati.
* **Funzioni Extra:** Sviluppo su richiesta dietro piccolo contributo simbolico.
* **Assistenza Fisica:** Disponibile a discrezione dell'autore in zona **Savona e provincia**.

📧 **Contatto Ufficiale:** [bibocchia05@gmail.com](mailto:bibocchia05@gmail.com)

---

## ⚖️ Note Legali
* In nessun caso lo sviluppatore sarà responsabile per errori di cassa o problemi di rete locale.
* Tutti i diritti riservati. Il software diventerà Open Source (Apache 2.0) il **01-01-2030**.

---
*Realizzato con ❤️ da **Lorenzo Formento (Luna Wolfie)***

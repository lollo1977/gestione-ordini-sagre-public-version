# 🐺 Gestione Ordini Sagra - by Luna Wolfie

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Licenza](https://img.shields.io/badge/Licenza-Proprietaria-blue)
![Version](https://img.shields.io/badge/Version-1.0.0-orange)

**Gestione Ordini Sagra** è l'applicazione definitiva per semplificare la presa degli ordini e la gestione della cassa durante sagre, festival ed eventi gastronomici. Sviluppata per essere veloce, intuitiva e affidabile, permette una comunicazione in tempo reale tra cassa e cucina.

---

## ✨ Caratteristiche Principali

* 🚀 **Velocità Estrema:** Interfaccia ottimizzata per non far perdere tempo alla cassa.
* 📱 **Multi-dispositivo:** Funziona su PC, Tablet e Smartphone via browser.
* 🔗 **WebSocket Real-time:** Gli ordini arrivano in cucina istantaneamente.
* 📊 **Riepilogo Totali:** Gestione automatica dei conti e delle quantità.
* 🖨️ **Stampa Scontrini:** Formattazione pronta per la stampa (con crediti personalizzabili).

---
## 🛠️ Stack Tecnologico

Il progetto è costruito con le migliori tecnologie web moderne per garantire stabilità e reattività:

* **Backend:** ![NodeJS](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white) - Motore JavaScript lato server veloce e scalabile.
* **Linguaggio:** ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) - Per un codice robusto e privo di errori logici.
* **Frontend:** ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black) - Struttura e logica client-side.
* **Styling:** ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white) - Design moderno, responsive e leggero.
* **Comunicazione:** ![WebSockets](https://img.shields.io/badge/WebSockets-010101?style=flat&logo=socketdotio&logoColor=white) - Per l'invio degli ordini in tempo reale senza ricaricare la pagina.

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
2.  **Installazione:** Il software può essere caricato su servizi cloud (come Render) o eseguito localmente.
3.  **Configurazione:** Modifica il menu e i prezzi direttamente dall'interfaccia dell'app.

---

## 🚀 Guida al Deploy su Render

### Prerequisiti
- [Node.js](https://nodejs.org) installato sul tuo computer (versione 18 o superiore)
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
- Numero di casse
- Menu e prezzi

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

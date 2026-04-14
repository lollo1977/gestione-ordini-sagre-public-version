// =============================================================================
//  CONFIGURAZIONE SAGRA - Personalizza qui la tua sagra!
//  FESTIVAL CONFIGURATION - Customize here for your own festival!
// =============================================================================
//
//  Questo file è l'unico punto da modificare per adattare l'app alla tua sagra.
//  This file is the single place to edit to adapt the app to your own festival.
//
//  I colori e tutte le altre opzioni si possono cambiare anche dall'app:
//  Colors and all other options can also be changed from within the app:
//  → Tab "Impostazioni" nella navigazione principale
//  → "Impostazioni" tab in the main navigation
// =============================================================================

export const CONFIG = {
  // ---------------------------------------------------------------------------
  //  NOME DELL'EVENTO / EVENT NAME
  // ---------------------------------------------------------------------------

  /** Nome breve mostrato nell'intestazione degli scontrini e nei report */
  /** Short name shown in receipt headers and reports */
  eventName: "CRCS BERGEGGI",

  /** Nome completo mostrato nel sottotitolo degli scontrini cliente */
  /** Full name shown in customer receipt subtitles */
  eventFullName: "Circolo Ricreativo Culturale Sportivo",

  /** Titolo dell'app mostrato nell'intestazione principale */
  /** App title shown in the main header */
  appTitle: "Gestione Ordini Sagra",

  // ---------------------------------------------------------------------------
  //  VALUTA / CURRENCY
  // ---------------------------------------------------------------------------

  /** Simbolo della valuta usato in tutto il sistema */
  /** Currency symbol used throughout the system */
  currencySymbol: "€",

  // ---------------------------------------------------------------------------
  //  STAMPANTE TERMICA / THERMAL PRINTER
  // ---------------------------------------------------------------------------

  /** Larghezza carta della stampante termica (es. "58mm", "80mm") */
  /** Thermal printer paper width (e.g. "58mm", "80mm") */
  printerPaperSize: "58mm",

  // ---------------------------------------------------------------------------
  //  COLORI DEL TEMA / THEME COLORS  (valori esadecimali / hex values)
  // ---------------------------------------------------------------------------

  /** Colore principale: bottoni, intestazioni, accenti primari */
  /** Primary color: buttons, headers, primary accents */
  primaryColor: "#2094f3",

  /** Colore secondario: totali, stati completati, badge */
  /** Secondary color: totals, completed states, badges */
  secondaryColor: "#43a047",

  /** Colore accento: avvisi, prezzi, evidenziazioni */
  /** Accent color: warnings, prices, highlights */
  accentColor: "#f57c00",

  // ---------------------------------------------------------------------------
  //  ETICHETTE CAMPI / FIELD LABELS
  // ---------------------------------------------------------------------------

  /** Etichetta per il numero tavolo (es. "Tavolo", "Banco", "Posto") */
  /** Label for table number (e.g. "Tavolo", "Banco", "Posto") */
  tableLabel: "Tavolo",

  /** Etichetta per il nome cliente (es. "Cliente", "Nome", "Ospite") */
  /** Label for customer name (e.g. "Cliente", "Nome", "Ospite") */
  customerLabel: "Cliente",

  /** Etichetta per il numero di coperti (es. "Coperti", "Persone", "Posti") */
  /** Label for covers count (e.g. "Coperti", "Persone", "Posti") */
  coversLabel: "Coperti",

  // ---------------------------------------------------------------------------
  //  METODI DI PAGAMENTO / PAYMENT METHODS
  // ---------------------------------------------------------------------------

  /** Etichetta per il pagamento in contanti */
  /** Label for cash payment */
  cashLabel: "Contanti",

  /** Etichetta per il pagamento con POS/carta */
  /** Label for card/POS payment */
  posLabel: "POS",

  /** Terzo metodo di pagamento (lascia vuoto "" per disabilitarlo) */
  /** Third payment method (leave empty "" to disable) */
  extraPaymentLabel: "",

  // ---------------------------------------------------------------------------
  //  MESSAGGI SCONTRINO / RECEIPT MESSAGES
  // ---------------------------------------------------------------------------

  /** Messaggio in fondo allo scontrino cucina */
  /** Message at the bottom of the kitchen receipt */
  kitchenReceiptMessage: "Buon lavoro! 🍽️",

  /** Messaggio in fondo allo scontrino cliente */
  /** Message at the bottom of the customer receipt */
  customerReceiptMessage: "Grazie per la vostra visita! 🎉",

  // ---------------------------------------------------------------------------
  //  NUMERO DI CASSE / NUMBER OF REGISTERS
  // ---------------------------------------------------------------------------

  /** Numero di casse attive */
  /** Number of active registers */
  numberOfRegisters: 2,

  /** Nomi personalizzati per ogni cassa (es. { "1": "Cassa Pizze", "2": "Cassa Bar" }) */
  /** Custom names for each register (e.g. { "1": "Pizza Counter", "2": "Bar" }) */
  registerNames: {} as Record<string, string>,

  /** Prezzo del coperto (0 = disabilitato) */
  coverPrice: 0,

  /** Gestione asporto abilitata */
  takeawayEnabled: false,

  /** Mostra il campo numero tavolo nel form ordine */
  showTableNumber: true,

  /** Mostra il campo nome cliente nel form ordine */
  showCustomerName: true,

  /** Mostra il campo coperti nel form ordine */
  showCovers: true,

  // ---------------------------------------------------------------------------
  //  CATEGORIE DEL MENÙ / MENU CATEGORIES
  // ---------------------------------------------------------------------------
  //
  //  Aggiungi, rimuovi o rinomina le categorie liberamente.
  //  Freely add, remove, or rename categories.
  //
  //  ATTENZIONE: la chiave (es. "antipasti") è salvata nel database.
  //  Se cambi una chiave già in uso, i piatti esistenti perderanno la categoria.
  //  WARNING: the key (e.g. "antipasti") is stored in the database.
  //  If you change a key already in use, existing dishes will lose their category.

  dishCategories: {
    antipasti: "Antipasti",
    primi: "Primi Piatti",
    secondi: "Secondi Piatti",
    contorni: "Contorni",
    dolci: "Dolci",
    bevande: "Bevande",
  } as Record<string, string>,

  // ---------------------------------------------------------------------------
  //  LOCALE (formato date e numeri / date and number format)
  // ---------------------------------------------------------------------------

  /** Locale per formattare date e orari (es. "it-IT", "en-GB", "de-DE") */
  /** Locale for formatting dates and times (e.g. "it-IT", "en-GB", "de-DE") */
  locale: "it-IT",
} as const;

// Tipo e valori esportati per retrocompatibilità con lo schema
// Exported type and values for schema backwards compatibility
export const DISH_CATEGORIES = CONFIG.dishCategories;
export type DishCategory = keyof typeof DISH_CATEGORIES;

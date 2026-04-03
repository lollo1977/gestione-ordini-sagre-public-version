# replit.md

## Overview

This is a full-stack restaurant order management system built with a modern React frontend and Express.js backend. The application enables restaurant staff to manage orders, dishes, and view sales analytics through an intuitive web interface. The system uses PostgreSQL with Drizzle ORM for data persistence and includes features for order tracking, menu management, and business reporting.

## User Preferences

Preferred communication style: Simple, everyday language.

## Customization for Fork

To adapt this app to a different festival/event, edit only **two files**:

1. **`shared/config.ts`** — Change event name, currency, categories, locale, printer paper size
2. **`client/src/index.css`** — Change theme colors (primary/secondary/accent near the top of the file)

All components automatically read from these two files — no other changes needed.

## Recent Changes

**April 2, 2026:**
- ✓ Creato `shared/config.ts` come punto unico di configurazione per tutta l'app
- ✓ Tutti i valori hardcoded spostati in config: nome evento, valuta, categorie, locale, carta stampante
- ✓ Commenti bilingue (IT/EN) aggiunti a config.ts e index.css per facilità di fork
- ✓ Aggiornati tutti i componenti (order-form, active-orders, reports, menu-management, export-utils) a leggere da config
- ✓ Aggiunto blocco commento colori in index.css che punta a shared/config.ts per le impostazioni

**August 2, 2025:**
- ✓ Font categorie piatti aumentati per massima leggibilità (cucina 16px, cliente 14px)
- ✓ Font nomi piatti aumentati (cucina 18px, cliente 13px) per leggibilità ottimale
- ✓ Valori numero tavolo, cliente e coperti più grandi e visibili
- ✓ "CRCS BERGEGGI" cucina aumentato a 16px + grassetto
- ✓ Rimosso emoji problematiche da entrambi gli scontrini
- ✓ Rimosso simbolo "x" dalle quantità per design più pulito
- ✓ Spazio carta termica 60mm - uscita automatica completa senza pulsanti
- ✓ 15 righe di spazio per strappare direttamente gli scontrini
- ✓ Layout finale perfetto per uso pratico quotidiano ristorante

**July 30, 2025:**
- ✓ Ottimizzato formato scontrini per carta termica 58mm
- ✓ Creato template dedicato receipt-templates.tsx per stampa compatta
- ✓ Font size ridotto e formattazione ottimizzata per stampanti termiche
- ✓ Larghezza scontrino adattata da 80mm a 58mm standard
- ✓ Margini ridotti per massimizzare spazio utile di stampa
- ✓ Rimossi dati di esempio automatici dal sistema
- ✓ Deploy sicuri senza perdita dati - database sempre persistente
- ✓ Sistema production-ready per hosting esterno senza sovrascritture

**July 29, 2025:**
- ✓ Migrazione progetto da Replit Agent a ambiente Replit standard completata
- ✓ Database PostgreSQL configurato e sincronizzato con schema aggiornato
- ✓ Aggiunto campo "Numero Coperti" nella creazione ordini
- ✓ Implementata gestione resto per pagamenti in contanti
- ✓ Validazione automatica importo insufficiente per pagamenti cash
- ✓ Aggiornati scontrini cucina e cliente per mostrare numero coperti
- ✓ Interfaccia migliorata con calcolo automatico del resto
- ✓ Sistema completo e funzionante in ambiente Replit standard
- ✓ Preparato deploy per Render.com con configurazione production-ready
- ✓ Creati file README.md, DEPLOY.md, render.yaml per deployment
- ✓ Sistema pronto per export e hosting su servizi cloud esterni
- ✓ Aggiunto supporto Supabase come alternativa database
- ✓ Creata guida SUPABASE.md per setup con database cloud

**January 28, 2025:**
- ✓ Sistema di gestione ordini completamente funzionante
- ✓ Risolto problema validazione nella creazione ordini (rimosso orderId requirement)
- ✓ Stampa scontrini cucina e cliente implementata e testata
- ✓ Interface italiana ottimizzata per sagre e ristoranti
- ✓ Sistema di reporting e analytics attivo
- ✓ Rimossi costi dei piatti dal sistema (solo prezzo di vendita)
- ✓ Implementata sincronizzazione real-time tra due casse tramite WebSocket
- ✓ Ottimizzata stampa per PC e dispositivi Android con formato termico 80mm
- ✓ Aggiunta selezione cassa all'avvio (CASSA 1/CASSA 2) con localStorage
- ✓ Sistema completo pronto per uso dual-register in sagre e ristoranti
- ✓ Aggiunta esportazione report in formato Word (.rtf) e Excel (.csv)
- ✓ Personalizzazione scontrini "CRCS Bergeggi" (logo rimosso per semplicità)
- ✓ Supporto tavoli con lettere (es. A1, VIP) oltre ai numeri

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Validation**: Zod schemas for request/response validation
- **Error Handling**: Centralized error middleware

### Development Setup
- **Monorepo Structure**: Unified TypeScript configuration across client/server/shared
- **Hot Reload**: Vite dev server with Express middleware integration
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

## Key Components

### Database Schema (shared/schema.ts)
- **dishes**: Menu items with name, price, and cost
- **orders**: Customer orders with table number, payment method, and status
- **orderItems**: Line items linking orders to dishes with quantities

### API Routes (server/routes.ts)
- **Dishes**: CRUD operations for menu management
- **Orders**: Create orders, retrieve active orders, complete orders
- **Analytics**: Daily statistics and reporting endpoints

### Frontend Components
- **OrderForm**: Create new orders with dish selection
- **ActiveOrders**: Real-time order tracking with kitchen/customer receipts
- **MenuManagement**: Add, edit, and delete menu items
- **Reports**: Business analytics and daily statistics

### Storage Layer
- **IStorage Interface**: Abstraction for data operations
- **DatabaseStorage**: PostgreSQL-backed persistent storage (active)
- **MemStorage**: In-memory implementation (kept as fallback)
- **Database Operations**: Full CRUD operations with proper error handling

## Data Flow

1. **Order Creation**: Customer orders are captured through the OrderForm component
2. **Real-time Updates**: ActiveOrders component polls for updates every 5 seconds
3. **Receipt Generation**: Kitchen and customer receipts are generated with print functionality
4. **Analytics Processing**: Daily statistics are calculated from completed orders
5. **Menu Management**: Dishes can be added, updated, or removed through the admin interface

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **wouter**: Lightweight React router
- **zod**: Schema validation for API requests/responses

### UI Libraries
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Type-safe variant management

### Development Tools
- **tsx**: TypeScript execution for Node.js
- **vite**: Frontend build tool and dev server
- **esbuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite compiles React app to static assets in `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database Migration**: Drizzle Kit handles schema migrations

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment flag (development/production)
- **REPL_ID**: Replit-specific configuration for development features

### Production Deployment
- **Static Assets**: Frontend served from `dist/public`
- **Server**: Express app runs on bundled Node.js code
- **Database**: PostgreSQL instance (configured via DATABASE_URL)

### Development Features
- **Replit Integration**: Cartographer plugin and dev banner for Replit environment
- **Error Overlay**: Runtime error modal for development debugging
- **File System Security**: Restricted file access for security

The application follows a clean separation of concerns with shared TypeScript types, centralized error handling, and a scalable component architecture suitable for restaurant operations.
/**
 * (c) 2024-2030 Lorenzo Formento (Luna Wolfie)
 * Progetto: Gestione Ordini Sagra
 * Licenza Proprietaria v2.1 - Tutti i diritti riservati.
 * Consultare il file LICENSE nella root del progetto per i termini completi.
 */
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertDishSchema, insertOrderSchema, insertOrderItemSchema } from "@shared/schema";
import { z } from "zod";
import express from "express";
import path from "path";

const createOrderRequestSchema = z.object({
  order: insertOrderSchema,
  items: z.array(insertOrderItemSchema)
});

// WebSocket clients for real-time sync
interface RegisterClient {
  socket: WebSocket;
  registerId?: number;
}

let wsClients: Set<RegisterClient> = new Set();

function broadcastToClients(data: any, excludeRegisterId?: number) {
  const message = JSON.stringify(data);
  wsClients.forEach(client => {
    if (client.socket.readyState === WebSocket.OPEN && client.registerId !== excludeRegisterId) {
      client.socket.send(message);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from attached_assets
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
  
  // Dishes routes
  app.get("/api/dishes", async (req, res) => {
    try {
      const dishes = await storage.getDishes();
      res.json(dishes);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero dei piatti" });
    }
  });

  app.post("/api/dishes", async (req, res) => {
    try {
      const dishData = insertDishSchema.parse(req.body);
      const dish = await storage.createDish(dishData);
      res.json(dish);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dati non validi", errors: error.errors });
      } else {
        res.status(500).json({ message: "Errore nella creazione del piatto" });
      }
    }
  });

  app.put("/api/dishes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const dishData = insertDishSchema.partial().parse(req.body);
      const dish = await storage.updateDish(id, dishData);
      
      if (!dish) {
        return res.status(404).json({ message: "Piatto non trovato" });
      }
      
      res.json(dish);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Dati non validi", errors: error.errors });
      } else {
        res.status(500).json({ message: "Errore nell'aggiornamento del piatto" });
      }
    }
  });

  app.delete("/api/dishes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDish(id);
      
      if (!success) {
        return res.status(404).json({ message: "Piatto non trovato" });
      }
      
      res.json({ message: "Piatto eliminato con successo" });
    } catch (error) {
      res.status(500).json({ message: "Errore nell'eliminazione del piatto" });
    }
  });

  // Orders routes
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero degli ordini" });
    }
  });

  app.get("/api/orders/active", async (req, res) => {
    try {
      const activeOrders = await storage.getActiveOrders();
      res.json(activeOrders);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero degli ordini attivi" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Ordine non trovato" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero dell'ordine" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      const { order, items } = createOrderRequestSchema.parse(req.body);
      const createdOrder = await storage.createOrder(order, items);
      
      // Broadcast new order to all connected clients
      broadcastToClients({
        type: "ORDER_CREATED",
        data: createdOrder
      });
      
      res.json(createdOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", error.errors);
        res.status(400).json({ message: "Dati non validi", errors: error.errors });
      } else {
        console.log("Server error:", error);
        res.status(500).json({ message: "Errore nella creazione dell'ordine" });
      }
    }
  });

  app.delete("/api/orders/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteOrder(id);

      if (!success) {
        return res.status(404).json({ message: "Ordine non trovato" });
      }

      broadcastToClients({
        type: "ORDER_DELETED",
        data: { orderId: id }
      });

      res.json({ message: "Ordine stornato con successo" });
    } catch (error) {
      res.status(500).json({ message: "Errore nello storno dell'ordine" });
    }
  });

  app.put("/api/orders/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.completeOrder(id);
      
      if (!success) {
        return res.status(404).json({ message: "Ordine non trovato" });
      }
      
      // Broadcast order completion to all connected clients
      broadcastToClients({
        type: "ORDER_COMPLETED",
        data: { orderId: id }
      });
      
      res.json({ message: "Ordine completato con successo" });
    } catch (error) {
      res.status(500).json({ message: "Errore nel completamento dell'ordine" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/daily", async (req, res) => {
    try {
      const stats = await storage.getDailyStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero delle statistiche" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Errore nel recupero delle impostazioni" });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      broadcastToClients({ type: "SETTINGS_UPDATED", data: settings });
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Errore nell'aggiornamento delle impostazioni" });
    }
  });

  // Clear all data except menu
  app.delete("/api/data/clear-except-menu", async (req, res) => {
    try {
      const success = await storage.clearAllDataExceptMenu();
      
      if (!success) {
        return res.status(500).json({ message: "Errore nella cancellazione dei dati" });
      }
      
      // Broadcast data clear to all connected clients
      broadcastToClients({
        type: "DATA_CLEARED",
        data: {}
      });
      
      res.json({ message: "Tutti i dati sono stati cancellati tranne il menù" });
    } catch (error) {
      res.status(500).json({ message: "Errore nella cancellazione dei dati" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time synchronization
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    const client: RegisterClient = { socket: ws };
    wsClients.add(client);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'REGISTER_CLIENT' && message.registerId) {
          client.registerId = message.registerId;
          console.log(`Client registered as CASSA ${message.registerId}`);
          
          // Send current active orders to newly connected client
          storage.getActiveOrders().then(orders => {
            ws.send(JSON.stringify({
              type: 'INITIAL_SYNC',
              data: orders
            }));
          });
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      wsClients.delete(client);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      wsClients.delete(client);
    });
  });
  
  return httpServer;
}

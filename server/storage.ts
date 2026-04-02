import { type Dish, type InsertDish, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type OrderWithItems, type DishSales, type DailyStats, type AppSettings } from "@shared/schema";
import { CONFIG } from "@shared/config";
import { randomUUID } from "crypto";

export interface IStorage {
  // Dishes
  getDishes(): Promise<Dish[]>;
  getDish(id: string): Promise<Dish | undefined>;
  createDish(dish: InsertDish): Promise<Dish>;
  updateDish(id: string, dish: Partial<InsertDish>): Promise<Dish | undefined>;
  deleteDish(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getActiveOrders(): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  completeOrder(id: string): Promise<boolean>;

  // Analytics
  getDailyStats(): Promise<DailyStats>;
  
  // Data management
  clearAllDataExceptMenu(): Promise<boolean>;

  // Settings
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
}

export class MemStorage implements IStorage {
  private dishes: Map<string, Dish>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private settings: AppSettings;

  constructor() {
    this.dishes = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.settings = {
      eventName: CONFIG.eventName,
      eventFullName: CONFIG.eventFullName,
      appTitle: CONFIG.appTitle,
      currencySymbol: CONFIG.currencySymbol,
      printerPaperSize: CONFIG.printerPaperSize,
      locale: CONFIG.locale,
      primaryColor: CONFIG.primaryColor,
      secondaryColor: CONFIG.secondaryColor,
      accentColor: CONFIG.accentColor,
      tableLabel: CONFIG.tableLabel,
      customerLabel: CONFIG.customerLabel,
      coversLabel: CONFIG.coversLabel,
      cashLabel: CONFIG.cashLabel,
      posLabel: CONFIG.posLabel,
      extraPaymentLabel: CONFIG.extraPaymentLabel,
      kitchenReceiptMessage: CONFIG.kitchenReceiptMessage,
      customerReceiptMessage: CONFIG.customerReceiptMessage,
      numberOfRegisters: CONFIG.numberOfRegisters,
      coverPrice: CONFIG.coverPrice,
      takeawayEnabled: CONFIG.takeawayEnabled,
      showTableNumber: CONFIG.showTableNumber,
      showCustomerName: CONFIG.showCustomerName,
      showCovers: CONFIG.showCovers,
      dishCategories: { ...CONFIG.dishCategories },
    };
  }

  async getDishes(): Promise<Dish[]> {
    return Array.from(this.dishes.values());
  }

  async getDish(id: string): Promise<Dish | undefined> {
    return this.dishes.get(id);
  }

  async createDish(insertDish: InsertDish): Promise<Dish> {
    const id = randomUUID();
    const dish: Dish = { 
      ...insertDish, 
      id,
      category: insertDish.category || "primi"
    };
    this.dishes.set(id, dish);
    return dish;
  }

  async updateDish(id: string, updateData: Partial<InsertDish>): Promise<Dish | undefined> {
    const dish = this.dishes.get(id);
    if (!dish) return undefined;
    
    const updatedDish = { ...dish, ...updateData };
    this.dishes.set(id, updatedDish);
    return updatedDish;
  }

  async deleteDish(id: string): Promise<boolean> {
    return this.dishes.delete(id);
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  async getActiveOrders(): Promise<OrderWithItems[]> {
    const activeOrders = Array.from(this.orders.values())
      .filter(order => order.status === "active")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return Promise.all(activeOrders.map(async order => {
      const items = Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          dish: this.dishes.get(item.dishId)!
        }));
      
      return { ...order, items };
    }));
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => ({
        ...item,
        dish: this.dishes.get(item.dishId)!
      }));

    return { ...order, items };
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const orderId = randomUUID();
    const order: Order = {
      ...insertOrder,
      id: orderId,
      createdAt: new Date(),
      status: insertOrder.status || "active",
      covers: insertOrder.covers || 1
    };

    this.orders.set(orderId, order);

    const orderItemsWithIds: OrderItem[] = items.map(item => ({
      ...item,
      id: randomUUID(),
      orderId
    }));

    orderItemsWithIds.forEach(item => {
      this.orderItems.set(item.id, item);
    });

    const itemsWithDishes = orderItemsWithIds.map(item => ({
      ...item,
      dish: this.dishes.get(item.dishId)!
    }));

    return { ...order, items: itemsWithDishes };
  }

  async completeOrder(id: string): Promise<boolean> {
    const order = this.orders.get(id);
    if (!order) return false;

    const updatedOrder = { ...order, status: "completed" as const };
    this.orders.set(id, updatedOrder);
    return true;
  }

  async getDailyStats(): Promise<DailyStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = Array.from(this.orders.values())
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });

    const totalRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = todayOrders.length;

    // Calculate dish sales
    const dishSalesMap = new Map<string, { quantity: number; revenue: number }>();
    
    todayOrders.forEach(order => {
      const items = Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id);
      
      items.forEach(item => {
        const dish = this.dishes.get(item.dishId);
        if (!dish) return;

        const existing = dishSalesMap.get(dish.id) || { quantity: 0, revenue: 0 };
        dishSalesMap.set(dish.id, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (parseFloat(item.price) * item.quantity)
        });
      });
    });

    const dishSales: DishSales[] = Array.from(dishSalesMap.entries()).map(([dishId, stats]) => {
      const dish = this.dishes.get(dishId)!;
      return {
        dish,
        quantity: stats.quantity,
        revenue: stats.revenue
      };
    });

    // Payment stats
    const cashOrders = todayOrders.filter(order => order.paymentMethod === 'cash');
    const posOrders = todayOrders.filter(order => order.paymentMethod === 'pos');
    const cashAmount = cashOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const posAmount = posOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

    return {
      totalRevenue,
      totalOrders,
      dishSales,
      paymentStats: {
        cash: {
          amount: cashAmount,
          percentage: totalRevenue > 0 ? (cashAmount / totalRevenue) * 100 : 0
        },
        pos: {
          amount: posAmount,
          percentage: totalRevenue > 0 ? (posAmount / totalRevenue) * 100 : 0
        }
      }
    };
  }

  async clearAllDataExceptMenu(): Promise<boolean> {
    try {
      this.orders.clear();
      this.orderItems.clear();
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  async getSettings(): Promise<AppSettings> {
    return { ...this.settings };
  }

  async updateSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
    this.settings = { ...this.settings, ...updates };
    return { ...this.settings };
  }
}

export const storage = new MemStorage();

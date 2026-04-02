import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Save, X, Plus, Minus, CreditCard, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Dish, InsertOrder, DishCategory } from "@shared/schema";
import { useAppSettings } from "@/hooks/use-app-settings";

interface OrderItem {
  dishId: string;
  quantity: number;
  price: string;
}

export default function OrderForm() {
  const settings = useAppSettings();
  const DISH_CATEGORIES = settings.dishCategories;
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [covers, setCovers] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "pos">("cash");
  const [orderItems, setOrderItems] = useState<Map<string, OrderItem>>(new Map());
  const [cashGiven, setCashGiven] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dishes = [], isLoading } = useQuery<Dish[]>({
    queryKey: ["/api/dishes"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (data: { order: InsertOrder; items: OrderItem[] }) => {
      const response = await apiRequest("POST", "/api/orders", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Ordine creato",
        description: "L'ordine è stato registrato con successo",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Errore nella creazione dell'ordine",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTableNumber("");
    setCustomerName("");
    setCovers(1);
    setPaymentMethod("cash");
    setOrderItems(new Map());
    setCashGiven("");
  };

  const updateQuantity = (dishId: string, dish: Dish, change: number) => {
    const newItems = new Map(orderItems);
    const current = newItems.get(dishId) || { dishId, quantity: 0, price: dish.price };
    const newQuantity = Math.max(0, current.quantity + change);

    if (newQuantity === 0) {
      newItems.delete(dishId);
    } else {
      newItems.set(dishId, { ...current, quantity: newQuantity });
    }

    setOrderItems(newItems);
  };

  const calculateTotal = () => {
    return Array.from(orderItems.values()).reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const missingTable = settings.showTableNumber && !tableNumber;
    const missingCustomer = settings.showCustomerName && !customerName;
    if (missingTable || missingCustomer || orderItems.size === 0) {
      toast({
        title: "Campi mancanti",
        description: "Compila tutti i campi obbligatori e aggiungi almeno un piatto",
        variant: "destructive",
      });
      return;
    }

    // Verifica pagamento in contanti
    if (paymentMethod === "cash") {
      const total = calculateTotal();
      const given = parseFloat(cashGiven) || 0;
      if (given < total) {
        toast({
          title: "Importo insufficiente",
          description: `Il cliente deve dare almeno ${settings.currencySymbol}${total.toFixed(2)}`,
          variant: "destructive",
        });
        return;
      }
    }

    const total = calculateTotal();
    const order: InsertOrder = {
      tableNumber: settings.showTableNumber ? tableNumber : "-",
      customerName: settings.showCustomerName ? customerName : "-",
      covers: settings.showCovers ? (covers || 1) : 1,
      total: total.toFixed(2),
      paymentMethod,
      status: "active",
    };

    const items = Array.from(orderItems.values()).map(item => ({
      dishId: item.dishId,
      quantity: item.quantity,
      price: item.price,
    }));

    createOrderMutation.mutate({ order, items });
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-xl shadow-sm border">
        <CardContent className="p-6">
          <div className="text-center">Caricamento piatti...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-xl shadow-sm border">
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="text-primary mr-3" />
          Nuovo Ordine
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {(settings.showTableNumber || settings.showCustomerName || settings.showCovers) && (
            <div className={`grid gap-4 ${[settings.showTableNumber, settings.showCustomerName, settings.showCovers].filter(Boolean).length === 1 ? "grid-cols-1" : [settings.showTableNumber, settings.showCustomerName, settings.showCovers].filter(Boolean).length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {settings.showTableNumber && (
                <div>
                  <Label htmlFor="tableNumber">{settings.tableLabel || "Tavolo"}</Label>
                  <Input
                    id="tableNumber"
                    type="text"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Es. 1, A2, VIP"
                    className="text-lg"
                    data-testid="input-tableNumber"
                  />
                </div>
              )}
              {settings.showCustomerName && (
                <div>
                  <Label htmlFor="customerName">{settings.customerLabel || "Cliente"}</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Mario Rossi"
                    data-testid="input-customerName"
                  />
                </div>
              )}
              {settings.showCovers && (
                <div>
                  <Label htmlFor="covers">{settings.coversLabel || "Coperti"}</Label>
                  <Input
                    id="covers"
                    type="number"
                    value={covers}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCovers(val === "" ? "" : parseInt(val));
                    }}
                    className="text-lg"
                    data-testid="input-covers"
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <Label>Seleziona Piatti per Categoria</Label>
            <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4">
              {Object.entries(DISH_CATEGORIES).map(([categoryKey, categoryLabel]) => {
                const categoryDishes = dishes.filter(dish => dish.category === categoryKey);
                
                if (categoryDishes.length === 0) return null;
                
                return (
                  <div key={categoryKey} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                    <h3 className="font-semibold text-primary mb-2 text-sm uppercase tracking-wide">
                      {categoryLabel}
                    </h3>
                    <div className="space-y-2">
                      {categoryDishes.map((dish) => {
                        const quantity = orderItems.get(dish.id)?.quantity || 0;
                        return (
                          <div
                            key={dish.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">{dish.name}</span>
                              <span className="text-secondary font-semibold ml-2">
                                {settings.currencySymbol}{parseFloat(dish.price).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="w-8 h-8 rounded-full p-0"
                                onClick={() => updateQuantity(dish.id, dish, -1)}
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{quantity}</span>
                              <Button
                                type="button"
                                size="sm"
                                className="w-8 h-8 rounded-full p-0"
                                onClick={() => updateQuantity(dish.id, dish, 1)}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Metodo di Pagamento</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button
                type="button"
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className={`p-4 h-auto ${
                  paymentMethod === "cash"
                    ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                    : "border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                <div className="text-center">
                  <Banknote className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium">
                    {paymentMethod === "cash" ? "✓ CONTANTI" : "Contanti"}
                  </span>
                </div>
              </Button>
              <Button
                type="button"
                variant={paymentMethod === "pos" ? "default" : "outline"}
                className={`p-4 h-auto ${
                  paymentMethod === "pos"
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                    : "border-gray-300 text-gray-600 bg-white hover:bg-gray-50"
                }`}
                onClick={() => setPaymentMethod("pos")}
              >
                <div className="text-center">
                  <CreditCard className="w-6 h-6 mx-auto mb-2" />
                  <span className="font-medium">
                    {paymentMethod === "pos" ? "✓ POS" : "POS"}
                  </span>
                </div>
              </Button>
            </div>
          </div>

          {paymentMethod === "cash" && orderItems.size > 0 && (
            <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Label htmlFor="cashGiven" className="text-green-800 font-semibold">
                Pagamento in Contanti
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cashGiven" className="text-sm text-green-700">
                    Importo ricevuto dal cliente
                  </Label>
                  <Input
                    id="cashGiven"
                    type="number"
                    step="0.01"
                    min="0"
                    value={cashGiven}
                    onChange={(e) => setCashGiven(e.target.value)}
                    placeholder="0.00"
                    className="text-lg border-green-300 focus:border-green-500"
                  />
                </div>
                <div>
                  <Label className="text-sm text-green-700">Resto da dare</Label>
                  <div className="h-10 flex items-center px-3 bg-white border border-green-300 rounded-md">
                    <span className="text-lg font-bold text-green-700">
                      {settings.currencySymbol}{(() => {
                        const total = calculateTotal();
                        const given = parseFloat(cashGiven) || 0;
                        const change = given - total;
                        return change >= 0 ? change.toFixed(2) : "0.00";
                      })()}
                    </span>
                  </div>
                </div>
              </div>
              {(() => {
                const total = calculateTotal();
                const given = parseFloat(cashGiven) || 0;
                if (given > 0 && given < total) {
                  return (
                    <div className="text-sm text-red-600 font-medium">
                      ⚠️ Importo insufficiente (mancano {settings.currencySymbol}{(total - given).toFixed(2)})
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          )}

          {orderItems.size > 0 && (
            <div className="border-t pt-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-800">Riepilogo Ordine:</h4>
                {Array.from(orderItems.values()).map((item) => {
                  const dish = dishes.find(d => d.id === item.dishId);
                  if (!dish) return null;
                  return (
                    <div key={item.dishId} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {dish.name}
                      </span>
                      <span className="font-medium">
                        {settings.currencySymbol}{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Coperti: {covers}</span>
                    <span></span>
                  </div>
                  <div className="flex justify-between font-bold text-lg">
                    <span>Totale:</span>
                    <span className="text-secondary">{settings.currencySymbol}{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            disabled={createOrderMutation.isPending || orderItems.size === 0}
          >
            <Save className="w-5 h-5 mr-2" />
            {createOrderMutation.isPending ? "Creazione..." : "Crea Ordine"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
import { Check, ShieldCheck, RefreshCcw, Headset, Truck } from "lucide-react";
import { Link } from "react-router";

export interface OrderConfirmationData {
  orderId: string | number;
  customerName: string;
  items: {
    id: number;
    name: string;
    image: string;
    price: number;
    quantity: number;
    volume?: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  address: {
    street: string;
    city: string;
    country: string;
  };
}

interface OrderConfirmationModalProps {
  order: OrderConfirmationData | null;
  onClose: () => void;
}

export function OrderConfirmationModal({ order, onClose }: OrderConfirmationModalProps) {
  if (!order) return null;

  // Estimated delivery: +2 to +4 days
  const today = new Date();
  const minDelivery = new Date(today);
  minDelivery.setDate(today.getDate() + 2);
  const maxDelivery = new Date(today);
  maxDelivery.setDate(today.getDate() + 4);
  
  const formatDate = (d: Date) => {
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f8f9fa]/80 backdrop-blur-sm">
      <div className="w-full max-w-[460px] bg-white rounded-[12px] shadow-sm border-[0.5px] border-[#e5e5e5] flex flex-col max-h-[90vh] overflow-y-auto overflow-x-hidden relative">
        
        {/* Header Section */}
        <div className="p-6 flex flex-col items-center text-center border-b-[0.5px] border-[#e5e5e5]">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF3DE] text-[#3B6D11] mb-5">
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="text-[11px] uppercase tracking-widest font-medium">Commande confirmée</span>
          </div>
          
          <h2 className="text-[22px] text-[#222222] font-medium mb-1.5">
            Merci, {order.customerName}.
          </h2>
          <p className="text-[14px] text-[#666666] font-normal leading-relaxed">
            Votre commande #{order.orderId} a été traitée. Un e-mail de confirmation vous a été envoyé.
          </p>
        </div>

        {/* Order Items */}
        <div className="p-6 border-b-[0.5px] border-[#e5e5e5]">
          <h3 className="text-[11px] uppercase tracking-widest font-medium text-[#666666] mb-4">Résumé de la commande</h3>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-[6px] border-[0.5px] border-[#e5e5e5] overflow-hidden bg-[#fafafa] flex-shrink-0">
                  <img src={item.image || "/images/bottle_shot.png"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] text-[#222222] font-medium truncate">{item.name}</h4>
                  <p className="text-[13px] text-[#888888] font-normal mt-0.5">
                    {item.volume || "100ml"} • Qté: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[14px] text-[#222222] font-medium">{(item.price * item.quantity).toFixed(0)} MAD</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t-[0.5px] border-[#e5e5e5] space-y-2">
            <div className="flex justify-between text-[13px] font-normal text-[#666666]">
              <span>Sous-total</span>
              <span>{order.subtotal.toFixed(0)} MAD</span>
            </div>
            <div className="flex justify-between text-[13px] font-normal text-[#666666]">
              <span>Livraison</span>
              <span>{order.shipping === 0 ? "Gratuite" : `${order.shipping.toFixed(0)} MAD`}</span>
            </div>
            <div className="flex justify-between text-[14px] font-medium text-[#222222] pt-2">
              <span>Total</span>
              <span>{order.total.toFixed(0)} MAD</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="p-6 border-b-[0.5px] border-[#e5e5e5] flex gap-6">
          <div className="flex-1">
            <h3 className="text-[11px] uppercase tracking-widest font-medium text-[#666666] mb-2">Adresse de livraison</h3>
            <p className="text-[13px] text-[#222222] font-normal leading-relaxed">
              {order.customerName}<br />
              {order.address.street}<br />
              {order.address.city}, {order.address.country}
            </p>
          </div>
          <div className="flex-1">
            <h3 className="text-[11px] uppercase tracking-widest font-medium text-[#666666] mb-2">Livraison estimée</h3>
            <p className="text-[13px] text-[#222222] font-normal leading-relaxed">
              {formatDate(minDelivery)} - {formatDate(maxDelivery)}<br />
              Standard Delivery
            </p>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="px-4 py-4 border-b-[0.5px] border-[#e5e5e5] bg-[#fafafa]">
          <div className="flex justify-between items-center text-[#888888]">
            <div className="flex flex-col items-center flex-1">
              <ShieldCheck className="w-4 h-4 mb-1.5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-center leading-tight">Paiement<br/>Sécurisé</span>
            </div>
            <div className="w-[0.5px] h-6 bg-[#e5e5e5]"></div>
            <div className="flex flex-col items-center flex-1">
              <RefreshCcw className="w-4 h-4 mb-1.5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-center leading-tight">Retour<br/>7 Jours</span>
            </div>
            <div className="w-[0.5px] h-6 bg-[#e5e5e5]"></div>
            <div className="flex flex-col items-center flex-1">
              <Headset className="w-4 h-4 mb-1.5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-center leading-tight">Support<br/>7/7</span>
            </div>
            <div className="w-[0.5px] h-6 bg-[#e5e5e5]"></div>
            <div className="flex flex-col items-center flex-1">
              <Truck className="w-4 h-4 mb-1.5" strokeWidth={1.5} />
              <span className="text-[10px] font-medium text-center leading-tight">Livraison<br/>Garantie</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex flex-col sm:flex-row gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-[6px] border-[0.5px] border-[#e5e5e5] text-[13px] font-medium text-[#222222] bg-white hover:bg-[#fafafa] transition-colors"
          >
            Continuer les achats
          </button>
          <Link 
            to="/orders"
            className="flex-1 py-3 px-4 rounded-[6px] text-[13px] font-medium text-white bg-[#222222] hover:bg-black transition-colors text-center"
          >
            Voir mes commandes
          </Link>
        </div>

      </div>
    </div>
  );
}

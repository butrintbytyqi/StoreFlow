export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Processing' | 'Completed' | 'Cancelled';
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  orderDate: Date;
}

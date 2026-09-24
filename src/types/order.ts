export type PaymentGateway = 'bKash' | 'Nagad' | 'Rocket'

export type OrderStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'REFUNDED'

export interface OrderRecord {
  id: string
  orderType: 'MATCH_SLOT' | 'STORE_PRODUCT'
  customerName: string
  whatsappNumber: string
  amountBDT: number
  gateway: PaymentGateway
  trxId: string
  status: OrderStatus
  createdAt: string
}

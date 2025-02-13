import request from '@/utils/request'

export interface TransferRequest {
  currency: string
  amount: number
  address?: string
}

export interface TransferRecord {
  id: string
  type: 'deposit' | 'withdraw'
  currency: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  time: string
  txHash?: string
}

export const getDepositAddress = async (currency: string) => {
  return request.get(`/assets/deposit-address/${currency}`)
}

export const createWithdraw = async (data: TransferRequest) => {
  return request.post('/assets/withdraw', data)
}

export const getTransferHistory = async () => {
  return request.get<TransferRecord[]>('/assets/transfer-history')
} 
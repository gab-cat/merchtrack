export type Log = {
  id: string
  userId?: string | null
  createdDate: Date
  createdById?: string | null
  reason: string
  systemText: string
  userText: string
}
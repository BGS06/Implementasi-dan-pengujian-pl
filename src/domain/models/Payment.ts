export class Payment {
  constructor(
    public readonly id: string,
    public readonly bookingId: string,
    public readonly amount: number,
    public method: 'QRIS' | 'VIRTUAL_ACCOUNT' | 'E_WALLET',
    public isPaid: boolean = false
  ) {}
}
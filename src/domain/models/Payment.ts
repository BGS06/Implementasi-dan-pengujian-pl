// src/domain/models/Payment.ts
import { IPaymentGateway, PaymentReceipt, PaymentType } from '../interfaces';

/**
 * Abstract Class PaymentMethod (Pilar Polimorfisme & Enkapsulasi)
 * Mengadaptasi sistem polimorfik TransferBank & Qris dari proyek RentPod lama ke TypeScript.
 */
export abstract class PaymentMethod implements IPaymentGateway {
  protected readonly transactionId: string;
  protected status: 'PENDING' | 'PAID' | 'FAILED';

  constructor() {
    this.transactionId = `TRX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.status = 'PENDING';
  }

  public abstract getPaymentType(): PaymentType;
  public abstract getProviderName(): string;
  public abstract validatePaymentDetails(): boolean;
  protected abstract generatePaymentInstruction(amount: number, bookingId: string): string;

  /**
   * Template Method yang memvalidasi dan memproses pembayaran secara polimorfik
   */
  public async processPayment(amount: number, bookingId: string): Promise<PaymentReceipt> {
    if (amount <= 0) {
      throw new Error('Nominal pembayaran harus lebih dari Rp 0.');
    }
    if (!this.validatePaymentDetails()) {
      this.status = 'FAILED';
      throw new Error(`Validasi detail pembayaran gagal untuk metode ${this.getProviderName()}.`);
    }

    const instruction = this.generatePaymentInstruction(amount, bookingId);
    this.status = 'PAID';

    return {
      transactionId: this.transactionId,
      bookingId,
      methodName: this.getPaymentType(),
      provider: this.getProviderName(),
      amountPaid: amount,
      paymentCodeOrQr: instruction,
      status: this.status,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 1. Subclass BankTransferPayment (Virtual Account BCA, Mandiri, BNI, BRI)
 */
export class BankTransferPayment extends PaymentMethod {
  private bankCode: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI';
  private virtualAccountNumber: string;

  constructor(bankCode: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI', customerPhone: string = '081234567890') {
    super();
    this.bankCode = bankCode;
    const prefixMap = { BCA: '8801', MANDIRI: '8902', BRI: '8703', BNI: '8604' };
    this.virtualAccountNumber = `${prefixMap[bankCode]}${customerPhone.replace(/\D/g, '').slice(-8)}`;
  }

  public override getPaymentType(): PaymentType {
    return 'BANK_TRANSFER';
  }

  public override getProviderName(): string {
    return `Bank ${this.bankCode} Virtual Account`;
  }

  public override validatePaymentDetails(): boolean {
    return this.virtualAccountNumber.length >= 10;
  }

  protected override generatePaymentInstruction(): string {
    return `VA-${this.bankCode}: ${this.virtualAccountNumber}`;
  }
}

/**
 * 2. Subclass QrisPayment (QRIS Dinamis Standar Nasional)
 */
export class QrisPayment extends PaymentMethod {
  private merchantNmid: string;

  constructor(merchantNmid: string = 'ID1026000998877') {
    super();
    this.merchantNmid = merchantNmid;
  }

  public override getPaymentType(): PaymentType {
    return 'QRIS';
  }

  public override getProviderName(): string {
    return 'QRIS Nasional (All E-Wallet & Mobile Banking)';
  }

  public override validatePaymentDetails(): boolean {
    return this.merchantNmid.startsWith('ID');
  }

  protected override generatePaymentInstruction(amount: number, bookingId: string): string {
    return `00020101021226580014ID.CO.QRIS.WWW0118${this.merchantNmid}520454995303360540${amount}5802ID5907RENTPOD62140510${bookingId.slice(0, 8)}`;
  }
}

/**
 * 3. Subclass EWalletPayment (GoPay / OVO / DANA)
 */
export class EWalletPayment extends PaymentMethod {
  private walletProvider: 'GOPAY' | 'OVO' | 'DANA';
  private phoneNumber: string;

  constructor(walletProvider: 'GOPAY' | 'OVO' | 'DANA', phoneNumber: string) {
    super();
    this.walletProvider = walletProvider;
    this.phoneNumber = phoneNumber;
  }

  public override getPaymentType(): PaymentType {
    return 'EWALLET';
  }

  public override getProviderName(): string {
    return `${this.walletProvider} Instant Push`;
  }

  public override validatePaymentDetails(): boolean {
    return /^08[0-9]{8,12}$/.test(this.phoneNumber);
  }

  protected override generatePaymentInstruction(): string {
    return `PUSH-NOTIF-${this.walletProvider}-${this.phoneNumber}`;
  }
}

export class PaymentFactory {
  public static create(
    type: PaymentType,
    providerOption: string,
    phoneNumber: string = '081234567890'
  ): IPaymentGateway {
    switch (type) {
      case 'BANK_TRANSFER':
        return new BankTransferPayment(
          (providerOption as 'BCA' | 'MANDIRI' | 'BRI' | 'BNI') || 'BCA',
          phoneNumber
        );
      case 'EWALLET':
        return new EWalletPayment(
          (providerOption as 'GOPAY' | 'OVO' | 'DANA') || 'GOPAY',
          phoneNumber
        );
      case 'QRIS':
      default:
        return new QrisPayment();
    }
  }
}
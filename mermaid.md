classDiagram
    direction TB
    
    class ITrackable {
        <<interface>>
        +updateLocation(lat: number, lng: number, speedKmh?: number) void
        +getTrackingTelemetry() TrackingTelemetry
    }

    class IPaymentGateway {
        <<interface>>
        +getPaymentType() PaymentType
        +getProviderName() string
        +validatePaymentDetails() boolean
        +processPayment(amount: number, bookingId: string) Promise~PaymentReceipt~
    }

    class IMembershipStrategy {
        <<interface>>
        +getTierName() MembershipTier
        +getDiscountPercentage(rentalDays: number) number
        +calculateDiscountAmount(grossAmount: number, rentalDays: number) number
        +getBenefits() string[]
    }

    class IAIAdvisor {
        <<interface>>
        +recommendCars(userPrompt: string, rentalDays: number, membership: IMembershipStrategy) Promise~AIRecommendationResult~
    }

    class User {
        <<abstract>>
        #id: string
        #name: string
        #email: string
        -passwordHash: string
        #role: UserRole
        +verifyPassword(plainPassword: string) Promise~boolean~
        +getDashboardRoute()* string
        +getPermissions()* string[]
    }

    class Admin {
        -department: string
        +getDashboardRoute() string
        +getPermissions() string[]
    }

    class Customer {
        -driverLicenseNumber: string
        -membership: IMembershipStrategy
        -loyaltyPoints: number
        +upgradeToVip() void
        +calculateDiscountedPrice(grossAmount: number, days: number) Object
        +getDashboardRoute() string
    }

    class Membership {
        <<abstract>>
        #tierName: MembershipTier
        +calculateDiscountAmount(grossAmount: number, rentalDays: number) number
        +getDiscountPercentage(rentalDays: number)* number
    }

    class RegularMembership {
        +getDiscountPercentage(rentalDays: number) number
    }

    class VipMembership {
        +getDiscountPercentage(rentalDays: number) number
    }

    class GpsCoordinate {
        -latitude: number
        -longitude: number
        -speedKmh: number
        -updatedAt: Date
        +setCoordinates(lat: number, lng: number) void
        +distanceToKm(target: GpsCoordinate) number
    }

    class Car {
        <<abstract>>
        #id: string
        #brand: string
        #model: string
        #licensePlate: string
        #baseRatePerDay: number
        #seatCapacity: number
        #status: CarStatus
        -gpsCoordinate: GpsCoordinate
        +updateLocation(lat: number, lng: number, speedKmh: number) void
        +getTrackingTelemetry() TrackingTelemetry
        +getCategory()* CarCategory
        +getInsuranceFeePerDay()* number
        +calculateRentalCost(days: number)* number
    }

    class CityCar {
        +calculateRentalCost(days: number) number
    }

    class FamilyCar {
        -hasThirdRowSeat: boolean
        -luggageLiters: number
        +calculateRentalCost(days: number) number
    }

    class LuxuryCar {
        -chauffeurIncluded: boolean
        -securityDeposit: number
        +calculateRentalCost(days: number) number
    }

    class ElectricCar {
        -batteryCapacityKwh: number
        -rangeKm: number
        +calculateRentalCost(days: number) number
    }

    class PaymentMethod {
        <<abstract>>
        #transactionId: string
        #status: string
        +processPayment(amount: number, bookingId: string) Promise~PaymentReceipt~
        #generatePaymentInstruction(amount: number, bookingId: string)* string
    }

    class BankTransferPayment {
        -bankCode: string
        -virtualAccountNumber: string
    }

    class QrisPayment {
        -merchantNmid: string
    }

    class EWalletPayment {
        -walletProvider: string
        -phoneNumber: string
    }

    class Booking {
        -id: string
        -customer: Customer
        -car: Car
        -paymentGateway: IPaymentGateway
        -startDate: Date
        -endDate: Date
        +calculateInvoiceBreakdown() Object
        +checkout() Promise~PaymentReceipt~
    }

    class AICarAdvisorService {
        -carRepository: CarRepository
        +recommendCars(userPrompt: string, rentalDays: number, membership: IMembershipStrategy) Promise~AIRecommendationResult~
    }

    User <|-- Admin
    User <|-- Customer
    Customer *-- IMembershipStrategy
    IMembershipStrategy <|.. Membership
    Membership <|-- RegularMembership
    Membership <|-- VipMembership

    ITrackable <|.. Car
    Car *-- GpsCoordinate
    Car <|-- CityCar
    Car <|-- FamilyCar
    Car <|-- LuxuryCar
    Car <|-- ElectricCar

    IPaymentGateway <|.. PaymentMethod
    PaymentMethod <|-- BankTransferPayment
    PaymentMethod <|-- QrisPayment
    PaymentMethod <|-- EWalletPayment

    Booking *-- Customer
    Booking *-- Car
    Booking *-- IPaymentGateway

    IAIAdvisor <|.. AICarAdvisorService
    AICarAdvisorService ..> Car : analyzes
    AICarAdvisorService ..> IMembershipStrategy : applies discount
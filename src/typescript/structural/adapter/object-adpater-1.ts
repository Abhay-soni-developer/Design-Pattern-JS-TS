// My System
interface ShippingProvider {
  createShipment(orderId: string, weightInKg: number): Promise<ShipmentResult>;
}

interface ShipmentResult {
  shipmentId: string;
  estimatedDeliveryDate: Date;
}

// 3rd Party System
class LegacyCourierSDK {
  bookParcel(request: { reference: string; weightInGrams: number }): Promise<{
    tracking_code: string;
    eta: string;
  }> {
    return Promise.resolve({
      tracking_code: "SHIP-123",
      eta: "2026-08-10T00:00:00.000Z",
    });
  }
}

// Adapter
class LegacyCourierAdapter implements ShippingProvider {
  constructor(private readonly legacyCourierService: LegacyCourierSDK) {}

  async createShipment(
    orderId: string,
    weightInKg: number,
  ): Promise<ShipmentResult> {
    const result = await this.legacyCourierService.bookParcel({
      reference: orderId,
      weightInGrams: weightInKg * 1000,
    });

    const estimatedDeliveryDate: Date = new Date(result.eta);

    if (estimatedDeliveryDate.toString() === "Invalid Date") {
      throw new Error("eta supplied by legacy courier sdk in invalid");
    }

    return {
      shipmentId: result.tracking_code,
      estimatedDeliveryDate,
    };
  }
}

const provider: ShippingProvider = new LegacyCourierAdapter(
  new LegacyCourierSDK(),
);

const result = await provider.createShipment("ORDER-101", 2.5);

console.log(result.shipmentId);
console.log(result.estimatedDeliveryDate);

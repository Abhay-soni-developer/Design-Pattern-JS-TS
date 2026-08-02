import {
  InternalCustomer,
  PartnerCustomer,
} from "./bidirectional-separate-adapters.js";
import { InvalidDate, InvalidName, InvalidStatus } from "./errors.js";

interface BidirectionalCustomerAdapter {
  toPartner(customer: InternalCustomer): PartnerCustomer;
  fromPartner(customer: PartnerCustomer): InternalCustomer;
}

class PartnerCustomerAdapter implements BidirectionalCustomerAdapter {
  private static readonly validStatuses = ["ACTIVE", "INACTIVE"];

  toPartner(customer: InternalCustomer): PartnerCustomer {
    const date: string | undefined = customer.dateOfBirth
      .toISOString()
      .split("T")[0];

    if (!date) throw new InvalidDate();

    if (!customer.firstName) throw new InvalidName();
    const fullName = `${customer.firstName} ${customer.lastName}`;

    const partnerCustomer: PartnerCustomer = {
      customer_id: customer.id,
      full_name: `${customer.firstName} ${customer.lastName}`,
      birth_date: date,
      status: customer.isActive ? "ACTIVE" : "INACTIVE",
    };

    return partnerCustomer;
  }

  fromPartner(customer: PartnerCustomer): InternalCustomer {
    const [firstName, ...lastName] = customer.full_name.split(" ");

    if (!firstName || firstName === "") throw new InvalidName();

    const dob: Date = new Date(customer.birth_date);

    if (dob.toString() === "Invalid Date") {
      throw new InvalidDate();
    }

    if (!PartnerCustomerAdapter.validStatuses.includes(customer.status)) {
      throw new InvalidStatus();
    }

    const internalCustomer: InternalCustomer = {
      id: customer.customer_id,
      firstName,
      lastName: lastName.join(" "),
      dateOfBirth: dob,
      isActive: customer.status === "ACTIVE" ? true : false,
    };

    return internalCustomer;
  }
}

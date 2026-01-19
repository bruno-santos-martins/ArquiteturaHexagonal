import type { Customer } from '../../domain/customer/Customer';
import type { CustomerRepository } from '../../ports/repositories/CustomerRepository';
import { NotFoundError } from '../errors/ApplicationError';

export class GetCustomerByIdUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async execute(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }
}

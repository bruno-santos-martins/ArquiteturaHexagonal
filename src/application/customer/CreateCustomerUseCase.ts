import type { Customer } from '../../domain/customer/Customer';
import type { CustomerRepository } from '../../ports/repositories/CustomerRepository';
import { ConflictError } from '../errors/ApplicationError';

export type CreateCustomerInput = {
  name: string;
  age: number;
  cpf: string;
};

export class CreateCustomerUseCase {
  constructor(private readonly customerRepository: CustomerRepository) {}

  public async execute(input: CreateCustomerInput): Promise<Customer> {
    const existing = await this.customerRepository.findByCpf(input.cpf);

    if (existing) {
      throw new ConflictError(
        'CUSTOMER_ALREADY_EXISTS',
        'Customer with this CPF already exists'
      );
    }

    return this.customerRepository.create({
      name: input.name,
      age: input.age,
      cpf: input.cpf
    });
  }
}

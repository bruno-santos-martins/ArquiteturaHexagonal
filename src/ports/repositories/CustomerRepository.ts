import type { Customer } from '../../domain/customer/Customer';

export type CreateCustomerRepositoryInput = {
  name: string;
  age: number;
  cpf: string;
};

export interface CustomerRepository {
  create(input: CreateCustomerRepositoryInput): Promise<Customer>;
  findById(id: string): Promise<Customer | null>;
  findByCpf(cpf: string): Promise<Customer | null>;
}

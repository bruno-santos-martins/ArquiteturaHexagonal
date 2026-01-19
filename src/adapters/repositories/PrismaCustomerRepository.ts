import type { PrismaClient } from '@prisma/client';
import { Customer } from '../../domain/customer/Customer';
import type {
  CreateCustomerRepositoryInput,
  CustomerRepository
} from '../../ports/repositories/CustomerRepository';

export class PrismaCustomerRepository implements CustomerRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(input: CreateCustomerRepositoryInput): Promise<Customer> {
    const created = await this.prisma.customer.create({
      data: {
        name: input.name,
        age: input.age,
        cpf: input.cpf
      }
    });

    return Customer.fromPersistence(created);
  }

  public async findById(id: string): Promise<Customer | null> {
    const found = await this.prisma.customer.findUnique({ where: { id } });
    return found ? Customer.fromPersistence(found) : null;
  }

  public async findByCpf(cpf: string): Promise<Customer | null> {
    const found = await this.prisma.customer.findUnique({ where: { cpf } });
    return found ? Customer.fromPersistence(found) : null;
  }
}

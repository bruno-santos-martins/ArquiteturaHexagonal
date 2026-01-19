import type { PrismaClient } from '@prisma/client';
import { CreateCustomerUseCase } from '../application/customer/CreateCustomerUseCase';
import { GetCustomerByIdUseCase } from '../application/customer/GetCustomerByIdUseCase';
import { PrismaCustomerRepository } from '../adapters/repositories/PrismaCustomerRepository';
import { CustomerController } from '../adapters/http/controllers/CustomerController';

export type Container = {
  customerController: CustomerController;
};

export const buildContainer = (prisma: PrismaClient): Container => {
  const customerRepository = new PrismaCustomerRepository(prisma);

  const createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
  const getCustomerByIdUseCase = new GetCustomerByIdUseCase(customerRepository);

  const customerController = new CustomerController(
    createCustomerUseCase,
    getCustomerByIdUseCase
  );

  return {
    customerController
  };
};

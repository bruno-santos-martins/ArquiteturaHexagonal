import type { HttpServer } from '../../../ports/http/HttpServer';
import type { CustomerController } from '../controllers/CustomerController';

export const registerCustomerRoutes = (
  httpServer: HttpServer,
  controller: CustomerController
): void => {
  httpServer.on('post', '/customers', controller.create);
  httpServer.on('get', '/customers/:id', controller.getById);
};

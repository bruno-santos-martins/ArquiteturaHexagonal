import type { CreateCustomerUseCase } from '../../../application/customer/CreateCustomerUseCase';
import type { GetCustomerByIdUseCase } from '../../../application/customer/GetCustomerByIdUseCase';
import type { HttpRequest } from '../../../ports/http/HttpRequest';
import type { HttpResponse } from '../../../ports/http/HttpResponse';
import {
  CreateCustomerBodySchema,
  CustomerParamsSchema,
  type CreateCustomerBodyDto,
  type CustomerParamsDto
} from '../validation/customer.schemas';
import { validate } from '../validation/validate';

export class CustomerController {
  constructor(
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase
  ) {}

  public create = async (request: HttpRequest): Promise<HttpResponse> => {
    const body = validate(CreateCustomerBodySchema, request.body) as CreateCustomerBodyDto;

    const customer = await this.createCustomerUseCase.execute(body);

    return {
      statusCode: 201,
      body: {
        data: customer.toJSON()
      }
    };
  };

  public getById = async (request: HttpRequest): Promise<HttpResponse> => {
    const params = validate(CustomerParamsSchema, request.params) as CustomerParamsDto;

    const customer = await this.getCustomerByIdUseCase.execute(params.id);

    return {
      statusCode: 200,
      body: {
        data: customer.toJSON()
      }
    };
  };
}

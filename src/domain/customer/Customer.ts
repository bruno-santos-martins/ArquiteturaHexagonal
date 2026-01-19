export type CustomerProps = {
  id: string;
  name: string;
  age: number;
  cpf: string;
};

export class Customer {
  public readonly id: string;
  public readonly name: string;
  public readonly age: number;
  public readonly cpf: string;

  private constructor(props: CustomerProps) {
    this.id = props.id;
    this.name = props.name;
    this.age = props.age;
    this.cpf = props.cpf;
  }

  public static fromPersistence(props: CustomerProps): Customer {
    return new Customer(props);
  }

  public toJSON(): CustomerProps {
    return { id: this.id, name: this.name, age: this.age, cpf: this.cpf };
  }
}

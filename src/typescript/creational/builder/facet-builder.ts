export interface IPersonalInfo {
  readonly firstName: string;
  readonly lastName: string;
  age: number;
  email?: string;
  phoneNumber?: string;
}

export interface IEmploymentInfo {
  company: string;
  designation: string;
  department: string;
  salary: number;
  readonly joiningDate: Date;
}

export interface IAddressInfo {
  country: string;
  state: string;
  city: string;
  street?: string;
  zipCode: string;
}

export interface IEmployee
  extends IPersonalInfo, IEmploymentInfo, IAddressInfo {}

export interface IEmployeeProfileBuilder {
  readonly address: IEmployeeAddressBuilder;
  readonly employment: IEmployeeEmploymentBuilder;

  withFirstName(firstname: string): this;
  withLastName(lastname: string): this;
  withAge(age: number): this;
  withEmail(email: string): this;
  withPhoneNumber(phoneNumber: string): this;

  build(): Employee;
}

export interface IEmployeeEmploymentBuilder {
  readonly personal: IEmployeeProfileBuilder;
  readonly address: IEmployeeAddressBuilder;

  worksAt(company: string): this;
  onDesignation(designation: string): this;
  inDepartment(department: string): this;
  since(joiningDate: Date): this;
  withSalary(salary: number): this;

  build(): Employee;
}

export interface IEmployeeAddressBuilder {
  readonly personal: IEmployeeProfileBuilder;
  readonly employment: IEmployeeEmploymentBuilder;

  inCountry(country: string): this;
  inState(state: string): this;
  inCity(city: string): this;
  onStreet(street: string): this;
  withZipCode(zipCode: string): this;

  build(): Employee;
}

export interface IEmployeeBuilder {
  readonly personal: IEmployeeProfileBuilder;
  readonly employment: IEmployeeEmploymentBuilder;
  readonly address: IEmployeeAddressBuilder;

  build(): Employee;
}

class Employee implements IEmployee {
  firstName: string;
  lastName: string;
  age: number;
  email?: string;
  phoneNumber?: string;
  company: string;
  designation: string;
  department: string;
  salary: number;
  joiningDate: Date;
  country: string;
  state: string;
  city: string;
  street?: string;
  zipCode: string;

  constructor(data: IEmployee) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.age = data.age;
    this.email = data.email;
    this.phoneNumber = data.phoneNumber;

    this.company = data.company;
    this.designation = data.designation;
    this.department = data.department;
    this.salary = data.salary;
    this.joiningDate = data.joiningDate;

    this.country = data.country;
    this.state = data.state;
    this.city = data.city;
    this.street = data.street;
    this.zipCode = data.zipCode;
  }
}

export class EmployeeProfileBuilder implements IEmployeeProfileBuilder {
  constructor(
    private employee: Partial<IEmployee>,
    private readonly root: IEmployeeBuilder,
  ) {}

  get address() {
    return this.root.address;
  }

  get employment() {
    return this.root.employment;
  }

  build(): Employee {
    return this.root.build();
  }

  withFirstName(firstname: string): this {
    this.employee.firstName = firstname;
    return this;
  }

  withLastName(lastname: string): this {
    this.employee.lastName = lastname;
    return this;
  }
  withAge(age: number): this {
    this.employee.age = age;
    return this;
  }

  withEmail(email: string): this {
    this.employee.email = email;
    return this;
  }

  withPhoneNumber(phoneNumber: string): this {
    this.employee.phoneNumber = phoneNumber;
    return this;
  }
}

export class EmployeeEmploymentBuilder implements IEmployeeEmploymentBuilder {
  constructor(
    private employee: Partial<IEmployee>,
    private readonly root: IEmployeeBuilder,
  ) {}

  get personal() {
    return this.root.personal;
  }

  get address() {
    return this.root.address;
  }

  build() {
    return this.root.build();
  }

  worksAt(company: string): this {
    this.employee.company = company;
    return this;
  }

  onDesignation(designation: string): this {
    this.employee.designation = designation;
    return this;
  }
  inDepartment(department: string): this {
    this.employee.department = department;
    return this;
  }

  since(joiningDate: Date): this {
    this.employee.joiningDate = joiningDate;
    return this;
  }
  withSalary(salary: number): this {
    this.employee.salary = salary;
    return this;
  }
}

export class EmployeeAddressBuilder implements IEmployeeAddressBuilder {
  constructor(
    private employee: Partial<IEmployee>,
    private readonly root: IEmployeeBuilder,
  ) {}

  get personal() {
    return this.root.personal;
  }

  get employment() {
    return this.root.employment;
  }

  build() {
    return this.root.build();
  }

  inCountry(country: string): this {
    this.employee.country = country;
    return this;
  }

  inState(state: string): this {
    this.employee.state = state;
    return this;
  }

  inCity(city: string): this {
    this.employee.city = city;
    return this;
  }

  onStreet(street: string): this {
    this.employee.street = street;
    return this;
  }

  withZipCode(zipCode: string): this {
    this.employee.zipCode = zipCode;
    return this;
  }
}

export class EmployeeBuilder implements IEmployeeBuilder {
  private readonly employee: Partial<IEmployee>;
  readonly personal: IEmployeeProfileBuilder;
  readonly employment: IEmployeeEmploymentBuilder;
  readonly address: IEmployeeAddressBuilder;
  private buildComplete: boolean = false;

  constructor() {
    this.employee = {};
    this.personal = new EmployeeProfileBuilder(this.employee, this);
    this.employment = new EmployeeEmploymentBuilder(this.employee, this);
    this.address = new EmployeeAddressBuilder(this.employee, this);
  }

  private static assertEmployeeValidation(
    employee: Partial<IEmployee>,
  ): asserts employee is IEmployee {}

  build(): Employee {
    if (this.buildComplete) throw new EmployeeBuilderInCompleteState();
    EmployeeBuilder.assertEmployeeValidation(this.employee);
    this.buildComplete = true;
    return new Employee(this.employee);
  }
}

export class EmployeeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class EmployeeMissing extends EmployeeError {
  constructor(message: string = "employee required") {
    super(message);
  }
}

export class EmployeeBuilderInCompleteState extends EmployeeError {
  constructor(
    message: string = "employee builder has already created the employee",
  ) {
    super(message);
  }
}

const employee = new EmployeeBuilder().personal
  .withFirstName("Abhay")
  .withLastName("Soni")
  .withAge(30)
  .withEmail("abhay@example.com")
  .employment.worksAt("OpenAI")
  .onDesignation("Software Engineer")
  .inDepartment("AI")
  .withSalary(250000)
  .since(new Date("2024-01-01"))
  .address.inCountry("India")
  .inState("Delhi")
  .inCity("New Delhi")
  .withZipCode("110001")
  .build();

const employee2 = new EmployeeBuilder().employment
  .worksAt("Meta")
  .onDesignation("SDE-2")
  .inDepartment("Infrastructure")
  .withSalary(200000)
  .since(new Date())
  .build();

const employee3 = new EmployeeBuilder().employment
  .worksAt("Meta")
  .onDesignation("SDE-2")
  .inDepartment("Infrastructure")
  .withSalary(200000)
  .since(new Date())
  .build();

new EmployeeBuilder().build();

const employee4 = new EmployeeBuilder().personal
  .withFirstName("Alice")
  .withLastName("Smith")
  .employment.worksAt("Amazon")
  .onDesignation("SDE")
  .inDepartment("Retail")
  .withSalary(170000)
  .since(new Date())
  .address.inCountry("USA")
  .inState("Washington")
  .inCity("Seattle")
  .withZipCode("98101")
  .build();

const employee5 = new EmployeeBuilder().personal
  .withFirstName("Abhay")
  .withFirstName("Rahul")
  .build();

const builder = new EmployeeBuilder();

builder.personal.withFirstName("Abhay");

builder.employment.worksAt("OpenAI");

builder.address.inCity("Delhi");

const employee6 = builder.build();

const builder1 = new EmployeeBuilder();

console.log(builder1.personal.employment === builder1.employment);

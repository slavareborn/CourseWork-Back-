export interface IUserRequest {
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  email: string;
  phone: string;
  password: string;
  city: string;
}

export interface IUserResponse {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  email: string;
  phone: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

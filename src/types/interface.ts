import { User } from '../repository/User.entity';

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
  user: User;
  token: string;
}

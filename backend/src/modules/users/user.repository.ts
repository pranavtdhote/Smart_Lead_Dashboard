import { UserModel } from './user.model';
import type { IUser } from './user.model';

export class UserRepository {
  static async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email }).exec();
  }

  static async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  static async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return user.save();
  }

  static async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
  }
}

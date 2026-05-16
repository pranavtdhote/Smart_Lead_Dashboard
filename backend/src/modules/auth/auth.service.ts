import { UserRepository } from '../users/user.repository';
import { Password, Jwt } from '../../utils';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../core';
import type { RegisterDto, LoginDto } from './auth.validation';
import type { IUser } from '../users/user.model';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  static async register(dto: RegisterDto): Promise<{ user: Partial<IUser>; tokens: AuthTokens }> {
    const existingUser = await UserRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const passwordHash = await Password.hash(dto.password);
    
    const user = await UserRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      passwordHash,
      role: dto.role,
    });

    const tokens = this.generateTokens(user);

    // Exclude password from the returned user object
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  static async login(dto: LoginDto): Promise<{ user: Partial<IUser>; tokens: AuthTokens }> {
    const user = await UserRepository.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await Password.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await UserRepository.updateLastLogin(String(user._id));

    const tokens = this.generateTokens(user);

    const { passwordHash: _, ...userWithoutPassword } = user.toObject();

    return {
      user: userWithoutPassword,
      tokens,
    };
  }

  static async refresh(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    try {
      const payload = Jwt.verify(refreshToken);
      const user = await UserRepository.findById(payload.userId);

      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      return { tokens: this.generateTokens(user) };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  static async getMe(userId: string): Promise<Partial<IUser>> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    const { passwordHash: _, ...userWithoutPassword } = user.toObject();
    return userWithoutPassword;
  }

  private static generateTokens(user: IUser): AuthTokens {
    const payload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: Jwt.signAccess(payload),
      refreshToken: Jwt.signRefresh(payload),
    };
  }
}

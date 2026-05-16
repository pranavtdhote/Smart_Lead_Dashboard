import bcrypt from 'bcryptjs';

export class Password {
  static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12); // Industry standard rounds
    return bcrypt.hash(password, salt);
  }

  static async compare(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}

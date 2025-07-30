import bcrypt from 'bcryptjs';

export const checkPassword = async (password: string, passwordHash: string): Promise<boolean> => {
  return await bcrypt.compare(password, passwordHash);
};

import bcrypt from "bcryptjs";

export const comparePassword = (password, hash) => {
  return bcrypt.compare(password, hash);
};

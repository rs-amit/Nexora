import api from "../lib/api";

type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

type SigninPayload = {
  email: string;
  password: string;
};

export const signupApi = (data: SignupPayload) =>
  api.post("/auth/signup", data);

export const signinApi = (data: SigninPayload) =>
  api.post("/auth/login", data);

export interface ValidatedUser {
  _id: string;
  name: string;
  email: string;
}

export interface ValidateUsersResponse {
  success: boolean;
  totalRequested: number;
  totalFound: number;
  users: ValidatedUser[];
  missingUsers: string[];
}

export const validateUsers = async (
  userIds: string[]
): Promise<ValidateUsersResponse> => {
  const response = await api.post("/auth/validate-users", { userIds });

  return response.data;
};
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

export interface SearchedUser {
  _id: string;
  name: string;
  email: string;
}

export interface SearchUsersResponse {
  success: boolean;
  users: SearchedUser[];
}

export const searchUsers = async (query: string): Promise<SearchedUser[]> => {
  const response = await api.get<SearchUsersResponse>("/auth/search-users", {
    params: { q: query },
  });

  return response.data.users;
};
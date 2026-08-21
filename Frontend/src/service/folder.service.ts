import api from "../lib/api";


export const getFolders = async () => {
  const response = await api.get("/folders");

  return response.data;
};

export const createFolder = async (
  data: {
    name: string;
    parentFolder?: string | null;
  }
) => {
  const response = await api.post(
    "/folders",
    data
  );

  return response.data;
};
import api from "../lib/api";


export const getFilesByFolder = async (
  folderId: string
) => {
  const response = await api.get(
    `/files/${folderId}`
  );

  return response.data;
};

export const createFile = async (
  data: {
    name: string;
    folderId: string;
  }
) => {
  const response = await api.post(
    "/files",
    data
  );

  return response.data;
};
import API from "./api";

export const getVapiConfig = async (
  name: string,
  jobRole: string,
  experience: number,
  level: string
) => {
  const response = await API.post("/interview/config", {
    name,
    job_role: jobRole,
    experience,
    level,
  });
  return response.data;
};

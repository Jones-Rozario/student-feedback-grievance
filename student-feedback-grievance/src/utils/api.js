import axios from "axios";

export const apiFetch = (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : undefined,
    "Content-Type": options.headers?.["Content-Type"] || "application/json",
  };
  return fetch(url, { ...options, headers });
};

export const apiAxios = () => {
  const token = localStorage.getItem("token");
  console.log(token);
  return axios.create({
    baseURL: "http://10.5.14.94:5000/api",
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      "Content-Type": "application/json",
    },
  });
};

export function getAcademicYear() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() is 0-based

  // If current month is June or later, academic year starts this year
  const startYear = month >= 6 ? year : year - 1;
  const endYear = String(startYear + 1);

  return `${startYear}-${endYear.substring(2, 4)}`;
}

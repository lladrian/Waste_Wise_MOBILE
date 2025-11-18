import { Barangay } from "../types";
import api from "./api";

export const barangayService = {
  async getAllBarangay(): Promise<Barangay[]> {
    const response = await api.get(`/barangays/get_all_barangay`);
    return response.data.data;
  },
};

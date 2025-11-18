import { Report } from '../types';
import api from './api';

interface SubmitReportData {
  type: Report["type"];
  description: string;
  location: string;
  urgency: "low" | "medium" | "high";
  barangay: string;
  submittedBy: string;
}

export const reportService = {
  async submitReport(reportData: SubmitReportData): Promise<Report> {
    const response = await api.post("/reports", reportData);
    return response.data;
  },

  async getUserReports(userId: string): Promise<Report[]> {
    const response = await api.get(`/reports/user/${userId}`);
    return response.data;
  },

  async getBarangayReports(barangay: string): Promise<Report[]> {
    const response = await api.get(`/reports/barangay/${barangay}`);
    return response.data;
  },
};

import api from '@/lib/axios';

export const adminService = {
  getDoctors: async (search: string = "", specialization: string = "") => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (specialization) params.append("specialization", specialization);
    const { data } = await api.get(`/admin/doctors?${params.toString()}`);
    return data;
  },

  createDoctor: async (doctorData: Record<string, unknown>) => {
    const { data } = await api.post('/admin/doctors', doctorData);
    return data;
  },

  updateDoctor: async (id: string, doctorData: Record<string, unknown>) => {
    const { data } = await api.put(`/admin/doctors/${id}`, doctorData);
    return data;
  },

  deleteDoctor: async (id: string) => {
    const { data } = await api.delete(`/admin/doctors/${id}`);
    return data;
  },

  getDoctorAvailability: async (id: string) => {
    const { data } = await api.get(`/admin/doctors/${id}/availability`);
    return data;
  }
};

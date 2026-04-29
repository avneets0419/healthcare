"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, Mail, Phone, Users, UserCheck, UserX, Eye, Edit, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/shared/StatCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { adminService } from "@/services/admin.service"
import api from "@/lib/axios"

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  email: string;
  phone: string;
  experience: string;
  status: string;
  image: string;
}

const getAvatarStyle = (name: string) => {
  if (!name) return "bg-emerald-100 text-emerald-700";
  const charCode = name.charCodeAt(4) || 0;
  const styles = [
    "bg-gradient-to-br from-emerald-100 to-teal-100 text-teal-700 dark:from-emerald-900/50 dark:to-teal-900/50 dark:text-teal-300",
    "bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 dark:from-emerald-900/40 dark:to-green-900/40 dark:text-emerald-300",
    "bg-gradient-to-br from-teal-50 to-cyan-100 text-cyan-700 dark:from-teal-900/40 dark:to-cyan-900/40 dark:text-cyan-300",
  ];
  return styles[charCode % styles.length];
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [specialization, setSpecialization] = useState("")
  const [loading, setLoading] = useState(true)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Doctor | null>(null)

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', specialization: '', experience: '', password: '' })

  const fetchDoctors = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token"); // ✅ get token


      const res = await api.get("/admin/doctors", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ force send token
        },
      });

      setDoctors(res.data);
    } catch (err) {
      console.error("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchDoctors(), 400)
    return () => clearTimeout(timer)
  }, [searchQuery, specialization])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to completely remove this doctor?')) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/doctors/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ added
        },
      });

      fetchDoctors();
    } catch (e) {
      alert('Error deleting doctor');
    }
  };

  const openNewModal = () => {
    setEditingDoc(null);
    setFormData({ name: '', email: '', phone: '', specialization: '', experience: '', password: '' });
    setIsModalOpen(true);
  }

  const openEditModal = (doc: Doctor) => {
    setEditingDoc(doc);
    setFormData({ name: doc.name, email: doc.email, phone: doc.phone || '', specialization: doc.specialization, experience: doc.experience || '', password: '' });
    setIsModalOpen(true);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        specialization: formData.specialization,
        experience: formData.experience,
        ...(formData.password ? { password: formData.password } : {}),
      };
      if (editingDoc) {

        await api.put(`/admin/doctors/${editingDoc.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ added
          },
        });
      } else {
        await api.post(`/admin/doctors`, payload, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ added
          },
        });
      }

      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      alert("Error saving doctor");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700 relative">
      {/* 1. Clear Visual Hierarchy + Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Doctors Directory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Manage your medical staff, view schedules, and monitor availability.
          </p>
        </div>
        <Button onClick={openNewModal} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm px-5 py-2.5 h-auto">
          <Plus className="mr-2 h-4 w-4" /> Add New Doctor
        </Button>
      </div>

      {/* 2. Top Summary Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Doctors"
          value={doctors.length}
          icon={Users}
          color="teal"
        />
        <StatCard
          title="Active Doctors"
          value={doctors.filter(d => d.status === "Active").length}
          icon={UserCheck}
          trend="up"
          trendValue="95% capacity"
          color="teal"
        />
        <StatCard
          title="On Leave"
          value={doctors.filter(d => d.status === "On Leave").length}
          icon={UserX}
          color="amber"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6">
        {/* 3. Improved Search & Filter UX */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="relative flex-1 w-full sm:max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search by doctor name or specialization..."
              className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-100/50 border-slate-200/60 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 shadow-inner rounded-xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select value={specialization} onChange={(e) => setSpecialization(e.target.value)} className="h-11 px-4 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-emerald-500/30 focus:border-emerald-500 outline-none cursor-pointer w-full sm:w-auto shadow-sm">
              <option value="">All Specializations</option>
              <option value="cardiology">Cardiology</option>
              <option value="neurology">Neurology</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="general">General</option>
            </select>
            <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 shadow-sm whitespace-nowrap">
              <Filter className="mr-2 h-4 w-4 text-slate-500" /> Filters
            </Button>
          </div>
        </div>

        {/* 4. Table Hybrid Design */}
        <div className="flex flex-col gap-3">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <div className="col-span-4">Doctor Details</div>
            <div className="col-span-2">Specialization</div>
            <div className="col-span-2">Experience</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right pr-4">Actions</div>
          </div>

          {!loading && doctors.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 font-medium">No doctors found matching your criteria.</p>
            </div>
          ) : (
            doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="group flex flex-col lg:grid lg:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-800/80 p-4 lg:px-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300"
              >
                {/* Profile */}
                <div className="col-span-4 w-full flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm bg-white text-emerald-700 dark:text-emerald-400">
                    <AvatarImage src={doctor.image} alt={doctor.name} />
                    <AvatarFallback className={`font-bold ${getAvatarStyle(doctor.name)}`}>
                      {doctor.name.replace("Dr. ", "").split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {doctor.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {doctor.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {doctor.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Specialization */}
                <div className="col-span-2 w-full lg:w-auto">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 text-xs font-semibold whitespace-nowrap">
                    {doctor.specialization}
                  </span>
                </div>

                {/* Experience */}
                <div className="col-span-2 w-full lg:w-auto text-sm font-medium text-slate-600 dark:text-slate-400">
                  {doctor.experience}
                </div>

                {/* Status */}
                <div className="col-span-2 w-full lg:w-auto">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${doctor.status === "Active"
                    ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    }`}>
                    {doctor.status === "Active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />}
                    {doctor.status === "On Leave" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />}
                    {doctor.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 w-full lg:w-auto flex items-center lg:justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-2">
                  <Button onClick={() => openEditModal(doctor)} variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20" title="Edit Doctor">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => handleDelete(doctor.id)} variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20" title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-lg p-6 lg:p-8 animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {editingDoc ? 'Edit Doctor Profile' : 'Onboard New Doctor'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                  <Input required placeholder="Dr. John Doe" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <Input required type="email" placeholder="doctor@mediso.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="bg-slate-50 dark:bg-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {editingDoc ? "Reset Password (optional)" : "Password"}
                  </label>
                  <Input
                    required={!editingDoc}
                    type="password"
                    placeholder={editingDoc ? "Leave blank to keep unchanged" : "Set doctor login password"}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                    <Input required placeholder="+1 (555) 001-2233" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-slate-50 dark:bg-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Experience</label>
                    <Input required placeholder="e.g. 10 years" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} className="bg-slate-50 dark:bg-slate-900" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Specialization</label>
                  <select required value={formData.specialization} onChange={e => setFormData({ ...formData, specialization: e.target.value })} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">Select Specialty</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Orthopedics">Orthopedics</option>
                    <option value="Dermatology">Dermatology</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 py-5">
                  {editingDoc ? 'Save Changes' : 'Confirm & Add Doctor'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

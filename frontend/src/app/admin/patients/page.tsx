"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, HeartPulse, Activity, UserCheck, Stethoscope, Eye, Edit, ArrowRightFromLine, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StatCard } from "@/components/shared/StatCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { RegisterPatientModal } from "@/components/admin/RegisterPatientModal"
import { ViewPatientModal } from "@/components/admin/ViewPatientModal"
import { patientService } from "@/services/admin-patient.service"
import { Patient } from "@/types/patient.types"
import { toast } from "sonner"

// Helps map a string to a predictable teal/emerald tint for avatars
const getAvatarStyle = (name: string) => {
  const charCode = name.charCodeAt(0) || 0;
  const styles = [
    "bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-800 dark:from-emerald-900/50 dark:to-green-900/50 dark:text-emerald-300",
    "bg-gradient-to-br from-teal-50 to-emerald-100 text-teal-800 dark:from-teal-900/40 dark:to-emerald-900/40 dark:text-teal-300",
    "bg-gradient-to-br from-green-50 to-cyan-100 text-green-800 dark:from-green-900/40 dark:to-cyan-900/40 dark:text-green-300",
  ];
  return styles[charCode % styles.length];
};

export default function AdminPatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterCondition, setFilterCondition] = useState("")
  const [filterDepartment, setFilterDepartment] = useState("")

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const data = await patientService.getPatients(searchQuery, filterStatus, filterCondition, filterDepartment)
      setPatients(data)
    } catch (error) {
      console.error("Failed to fetch patients:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewModalOpen(true)
  }

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsViewModalOpen(false)
    setIsModalOpen(true)
  }

  const handleDeletePatient = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this patient profile? This action cannot be undone.")) {
      try {
        await patientService.deletePatient(id)
        toast.success("Patient profile deleted successfully")
        setIsViewModalOpen(false)
        fetchPatients()
      } catch (error) {
        toast.error("Failed to delete patient profile")
      }
    }
  }

  const handleRegisterModalClose = () => {
    setIsModalOpen(false)
    setSelectedPatient(null)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, filterStatus, filterCondition, filterDepartment])

  return (
    <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
      {/* ... header and stat cards same as before ... */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Patient Roster
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            Monitor admissions, track treatment progress, and manage patient records.
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedPatient(null);
            setIsModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all text-sm px-5 py-2.5 h-auto"
        >
          <Plus className="mr-2 h-4 w-4" /> Register Patient
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={patients.length}
          icon={UserCheck}
          color="teal"
        />
        <StatCard
          title="Active Cases"
          value={patients.filter(p => p.status?.toLowerCase() === "active").length}
          icon={Activity}
          trend="up"
          trendValue="Healthy stable"
          color="teal"
        />
        <StatCard
          title="Under Treatment"
          value={patients.filter(p => p.status?.toLowerCase() === "under_treatment").length}
          icon={Stethoscope}
          color="amber"
          trend="neutral"
          trendValue="In progress"
        />
        <StatCard
          title="Recovered"
          value={patients.filter(p => p.status?.toLowerCase() === "recovered").length}
          icon={HeartPulse}
          color="teal"
          trend="up"
          trendValue="+1 this week"
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-800/80 p-3 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50">
          <div className="relative flex-1 w-full sm:max-w-[28rem] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <Input
              placeholder="Search by patient name or ID..."
              className="pl-11 h-11 bg-slate-50/50 hover:bg-slate-100/50 border-slate-200/60 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 shadow-inner rounded-xl transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              className="h-11 px-4 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-emerald-500/30 focus:border-emerald-500 outline-none cursor-pointer w-full sm:w-auto shadow-sm text-slate-600 dark:text-slate-300"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">Status: All</option>
              <option value="active">Active</option>
              <option value="under_treatment">Under Treatment</option>
              <option value="recovered">Recovered</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              className="h-11 px-4 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-emerald-500/30 focus:border-emerald-500 outline-none cursor-pointer w-full sm:w-auto shadow-sm text-slate-600 dark:text-slate-300 hidden md:block"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="">Dept: All</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Neurology">Neurology</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Oncology">Oncology</option>
              <option value="General Medicine">General Medicine</option>
            </select>
            <Button variant="outline" className="h-11 px-5 rounded-xl border-slate-200 hover:bg-slate-50 dark:border-slate-700 shadow-sm whitespace-nowrap">
              <Filter className="mr-2 h-4 w-4 text-slate-500" /> Filter
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">
            <div className="col-span-4">Patient Profile</div>
            <div className="col-span-2">Admission Date</div>
            <div className="col-span-2">Condition</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right pr-4">Actions</div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mb-4" />
              <p className="text-slate-400 font-medium">Fetching patient records...</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-16 bg-white dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 font-medium">No patients found within these filter bounds.</p>
            </div>
          ) : (
            patients.map((patient) => (
              <div
                key={patient.id}
                className="group flex flex-col lg:grid lg:grid-cols-12 gap-4 items-center bg-white dark:bg-slate-800/80 p-4 lg:px-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-emerald-100 dark:hover:border-emerald-900/30 transition-all duration-300"
              >
                <div className="col-span-4 w-full flex items-center gap-4">
                  <Avatar className="h-12 w-12 border-2 border-white dark:border-slate-800 shadow-sm bg-white">
                    <AvatarFallback className={`font-bold ${getAvatarStyle(patient.name)}`}>
                      {patient.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {patient.name}
                    </h4>
                    <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400">
                      <span>#{patient.patientId || "N/A"}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span>{patient.age || "?"} yrs</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                      <span>{patient.gender || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 w-full lg:w-auto text-sm text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                  {new Date(patient.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
                </div>

                <div className="col-span-2 w-full lg:w-auto">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-xs font-semibold whitespace-nowrap shadow-sm">
                    {patient.condition || "General"}
                  </span>
                </div>

                <div className="col-span-2 w-full lg:w-auto">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-sm ${patient.status?.toLowerCase() === "active"
                      ? "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                      : patient.status?.toLowerCase() === "recovered"
                        ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50"
                        : patient.status?.toLowerCase() === "under_treatment"
                          ? "bg-amber-100/80 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}>
                    {patient.status?.toLowerCase() === "active" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />}
                    {patient.status?.toLowerCase() === "under_treatment" && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2" />}
                    {patient.status?.toLowerCase() === "recovered" && <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mr-2" />}
                    {patient.status?.replace("_", " ")}
                  </span>
                </div>

                <div className="col-span-2 w-full lg:w-auto flex items-center lg:justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    title="View Patient Record"
                    onClick={() => handleViewPatient(patient)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20"
                    title="Edit Patient"
                    onClick={() => handleEditPatient(patient)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete Patient"
                    onClick={() => handleDeletePatient(patient.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <RegisterPatientModal
        isOpen={isModalOpen}
        onClose={handleRegisterModalClose}
        onSuccess={fetchPatients}
        patient={selectedPatient}
      />

      <ViewPatientModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        patient={selectedPatient}
        onEdit={handleEditPatient}
        onDelete={handleDeletePatient}
      />
    </div>
  )
}

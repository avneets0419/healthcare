"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { HistoryCard } from "@/components/patient/HistoryCard";
import { HistoryModal, MedicalRecord } from "@/components/patient/HistoryModal";
import { Input } from "@/components/ui/input";
import { Search, Loader2, FileText } from "lucide-react";

// Mock Data
const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: "r1",
    doctorName: "Dr. Sarah Smith",
    date: new Date(Date.now() - 5 * 24 * 3600_000).toISOString(),
    diagnosis: "Fever & Cold",
    status: "Completed",
    notes: "Patient advised to take rest for 3 days and drink plenty of fluids.",
    medicines: [
      { name: "Paracetamol", dosage: "500mg", frequency: "Twice a day", duration: "3 Days" },
      { name: "Vitamin C", dosage: "1000mg", frequency: "Once a day", duration: "5 Days" },
    ]
  },
  {
    id: "r2",
    doctorName: "Dr. John Doe",
    date: new Date(Date.now() - 15 * 24 * 3600_000).toISOString(),
    diagnosis: "Routine Dental Checkup",
    status: "Completed",
    notes: "No cavities found. Advised to floss daily.",
    medicines: []
  },
  {
    id: "r3",
    doctorName: "Dr. Jessica Wilson",
    date: new Date(Date.now() - 40 * 24 * 3600_000).toISOString(),
    diagnosis: "Mild Hypertension",
    status: "Completed",
    notes: "BP slightly elevated. Monitor regularly.",
    medicines: [
      { name: "Amlodipine", dosage: "5mg", frequency: "Once a day", duration: "30 Days" }
    ]
  }
];

type FilterType = "All" | "Last 7 days" | "Last 30 days";

export default function MedicalHistoryPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");

  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      // API call to fetch history would go here
      // For now, simulate network delay and set mock data
      setTimeout(() => {
        setRecords(MOCK_RECORDS);
        setLoading(false);
      }, 800);
    } catch {
      setRecords(MOCK_RECORDS);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleViewDetails = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const filtered = useMemo(() => {
    const now = new Date().getTime();

    return records.filter((r) => {
      // 1. Must be completed
      if (r.status.toLowerCase() !== "completed") return false;

      // 2. Search match
      const searchMatch = r.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        r.date.includes(search);

      if (!searchMatch) return false;

      // 3. Date filter match
      const recordTime = new Date(r.date).getTime();
      const diffDays = (now - recordTime) / (1000 * 3600 * 24);

      if (activeFilter === "Last 7 days" && diffDays > 7) return false;
      if (activeFilter === "Last 30 days" && diffDays > 30) return false;

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records, search, activeFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="relative">
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white relative z-10">
            Medical History
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest relative z-10">
            Your past appointments and prescriptions
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by doctor or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-11 rounded-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm focus:ring-emerald-500/20"
          />
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {(["All", "Last 7 days", "Last 30 days"] as FilterType[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 border ${activeFilter === filter
                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900 dark:border-white"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800"
              }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Showing <strong className="text-slate-600 dark:text-slate-300">{filtered.length}</strong> medical records
      </p>

      {/* 3. History List */}
      <div className="pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-emerald-500" />
            <p className="text-sm font-bold uppercase tracking-widest">Loading history...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <FileText className="h-16 w-16 text-slate-200 dark:text-slate-800 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest">No medical history found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((record) => (
              <HistoryCard key={record.id} record={record} onViewDetails={handleViewDetails} />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <HistoryModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={selectedRecord}
      />
    </div>
  );
}
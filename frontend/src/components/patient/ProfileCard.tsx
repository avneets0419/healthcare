"use client";

import { Mail, Phone, Calendar, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PatientProfile {
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  bloodGroup?: string;
  avatar?: string;
}

interface ProfileCardProps {
  profile: PatientProfile;
  onEdit: () => void;
}

export function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500/20 to-emerald-500/20" />

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center mt-12">
        <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-lg shrink-0 overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-semibold text-slate-400">
              {profile.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight">
            {profile.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold uppercase tracking-widest">
              Patient
            </span>
          </div>
        </div>

        <Button onClick={onEdit} className="w-full md:w-auto h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold px-6 text-xs uppercase tracking-widest">
          Edit Profile
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
          <Mail className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Email</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
          <Phone className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Phone</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.phone || "Not provided"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
          <Calendar className="h-5 w-5 text-slate-400" />
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Date of Birth</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.dob || "Not provided"}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
          <Droplets className="h-5 w-5 text-rose-400" />
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Blood Group</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{profile.bloodGroup || "Not provided"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

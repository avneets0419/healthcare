"use client";

import { useState } from "react";
import { PatientProfile } from "./ProfileCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface EditProfileFormProps {
  profile: PatientProfile;
  onSave: (data: PatientProfile) => Promise<void>;
  onCancel: () => void;
}

export function EditProfileForm({ profile, onSave, onCancel }: EditProfileFormProps) {
  const [formData, setFormData] = useState<PatientProfile>(profile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email) {
      setError("Name and Email are required");
      return;
    }

    if (formData.phone && !/^\+?[0-9]{7,15}$/.test(formData.phone)) {
      setError("Invalid phone number format");
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight mb-6">
        Edit Profile
      </h2>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold border border-rose-100 dark:border-rose-900/30">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Full Name *</label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Email Address *</label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              required
              disabled
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
            <Input
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Date of Birth</label>
            <Input
              name="dob"
              type="date"
              value={formData.dob || ""}
              onChange={handleChange}
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Blood Group</label>
            <Input
              name="bloodGroup"
              value={formData.bloodGroup || ""}
              onChange={handleChange}
              placeholder="e.g. O+, A-, B+"
              className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            disabled={loading || !formData.name || !formData.email}
            className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase tracking-widest text-xs"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            className="flex-1 h-12 rounded-xl border-slate-200 dark:border-slate-700 font-bold uppercase tracking-widest text-xs"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

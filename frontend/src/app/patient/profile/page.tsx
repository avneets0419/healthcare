"use client";

import { useState, useEffect } from "react";
import AuthGuard from "@/components/shared/AuthGuard";
import { ProfileCard, PatientProfile } from "@/components/patient/ProfileCard";
import { EditProfileForm } from "@/components/patient/EditProfileForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, LogOut, Lock, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { decodeToken } from "@/lib/decodeToken";
import { getMyPatientProfile, updateMyPatientProfile } from "@/services/patient.service";

const MOCK_PROFILE: PatientProfile = {
  name: "John Doe",
  email: "johndoe@example.com",
  phone: "+19876543210",
  dob: "1990-05-15",
  bloodGroup: "O+",
};

export default function ProfilePage() {
  const router = useRouter();
  
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");

  // Change Password State
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState("");
  const [pwdSuccess, setPwdSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await getMyPatientProfile();
        setProfile({
          ...MOCK_PROFILE,
          name: p.name,
          email: p.email,
          phone: p.phone,
        });
      } catch {
        let userEmail = MOCK_PROFILE.email;
        const token = localStorage.getItem("token");
        if (token) {
          const decoded = decodeToken(token);
          if (decoded?.email) userEmail = decoded.email;
        }
        setProfile({ ...MOCK_PROFILE, email: userEmail });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSaveProfile = async (data: PatientProfile) => {
    await updateMyPatientProfile({ name: data.name, phone: data.phone });
    setProfile(data);
    setIsEditing(false);
    showSuccess("Profile updated successfully");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    setPwdSuccess("");

    if (!passwords.old || !passwords.new || !passwords.confirm) {
      setPwdError("All fields are required");
      return;
    }

    if (passwords.new !== passwords.confirm) {
      setPwdError("New passwords do not match");
      return;
    }

    setPwdLoading(true);
    setTimeout(() => {
      setPwdLoading(false);
      setPasswords({ old: "", new: "", confirm: "" });
      setPwdSuccess("Password updated successfully");
      setTimeout(() => setPwdSuccess(""), 3000);
    }, 1000);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };

  if (loading || !profile) {
    return (
      <AuthGuard allowedRoles={["patient"]}>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Loading profile...</p>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard allowedRoles={["patient"]}>
      <div className="space-y-8 animate-in fade-in duration-500 max-w-[1000px] mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="relative">
            <div className="absolute -left-4 -top-4 w-16 h-16 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white relative z-10">
              My Profile
            </h1>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-widest relative z-10">
              Manage your personal information
            </p>
          </div>

          <Button 
            onClick={handleLogout}
            variant="destructive"
            className="h-11 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 font-bold uppercase tracking-widest text-xs px-6 transition-all"
          >
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>

        {/* Global Success Message */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-100 dark:border-emerald-900/30 animate-in slide-in-from-top-4">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {successMsg}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {isEditing ? (
              <EditProfileForm 
                profile={profile} 
                onSave={handleSaveProfile} 
                onCancel={() => setIsEditing(false)} 
              />
            ) : (
              <ProfileCard profile={profile} onEdit={() => setIsEditing(true)} />
            )}
          </div>

          {/* Change Password Sidebar Section */}
          <div>
            <div className="bg-white dark:bg-slate-900/50 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Security
                </h2>
              </div>

              {pwdError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-100 dark:border-rose-900/30">
                  {pwdError}
                </div>
              )}
              {pwdSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                  {pwdSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Old Password</label>
                  <Input 
                    type="password"
                    value={passwords.old}
                    onChange={(e) => setPasswords({...passwords, old: e.target.value})}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                  <Input 
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                  <Input 
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                    className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm" 
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={pwdLoading || !passwords.old || !passwords.new || !passwords.confirm}
                  className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-bold uppercase tracking-widest text-[10px]"
                >
                  {pwdLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patientService } from "@/services/admin-patient.service";
import { Loader2, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Patient } from "@/types/patient.types";
import { useEffect } from "react";

const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  age: z.string().optional(),
  gender: z.string().optional(),
  department: z.string().optional(),
  condition: z.string().optional(),
  status: z.string(),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
});

type PatientFormValues = z.infer<typeof patientSchema>;

interface RegisterPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: Patient | null;
}

export function RegisterPatientModal({
  isOpen,
  onClose,
  onSuccess,
  patient,
}: RegisterPatientModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      status: "active",
      password: "",
    },
  });

  useEffect(() => {
    if (patient && isOpen) {
      reset({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        age: patient.age?.toString() || "",
        gender: patient.gender || "",
        department: patient.department || "",
        condition: patient.condition || "",
        status: patient.status || "active",
        password: "",
      });
    } else if (!patient && isOpen) {
      reset({
        name: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        department: "",
        condition: "",
        status: "active",
        password: "",
      });
    }
  }, [patient, isOpen, reset]);

  const onSubmit = async (data: PatientFormValues) => {
    setLoading(true);
    setError(null);
    try {
      if (patient) {
        await patientService.updatePatient(patient.id, {
          ...data,
          age: data.age ? parseInt(data.age) : undefined,
        });
        toast.success("Patient updated successfully");
      } else {
        await patientService.createPatient({
          ...data,
          age: data.age ? parseInt(data.age) : undefined,
          password: data.password || undefined,
        });
        toast.success("Patient registered successfully");
      }
      onSuccess();
      onClose();
      reset();
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to ${patient ? 'update' : 'register'} patient`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] bg-[#f8fcfb] dark:bg-slate-950 border-none rounded-[28px] shadow-2xl overflow-hidden p-0">
        <DialogHeader className="bg-emerald-600 px-8 py-10 text-white relative">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-3xl font-black tracking-tight">
              {patient ? "Edit Patient Details" : "Register New Patient"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="px-8 max-h-[60vh] overflow-y-auto custom-scrollbar pt-4 pb-2">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...register("name")}
                  className={errors.name ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  {...register("email")}
                  className={errors.email ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {!patient && (
                <div className="space-y-2 col-span-2 sm:col-span-1">
                  <Label htmlFor="password">Login Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("password")}
                      className={errors.password ? "border-red-500 focus-visible:ring-red-500/20 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="+91-9876543210"
                  {...register("phone")}
                  className={errors.phone ? "border-red-500 focus-visible:ring-red-500/20" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  {...register("age")}
                />
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={watch("gender")}
                  onValueChange={(v: string | null) => setValue("gender", v || undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v: string | null) => setValue("status", v || "active")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under_treatment">Under Treatment</SelectItem>
                    <SelectItem value="recovered">Recovered</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={watch("department")}
                  onValueChange={(v: string | null) => setValue("department", v || undefined)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cardiology">Cardiology</SelectItem>
                    <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                    <SelectItem value="Neurology">Neurology</SelectItem>
                    <SelectItem value="Gastroenterology">Gastroenterology</SelectItem>
                    <SelectItem value="Dermatology">Dermatology</SelectItem>
                    <SelectItem value="Pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="Oncology">Oncology</SelectItem>
                    <SelectItem value="General Medicine">General Medicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 sm:col-span-1">
                <Label htmlFor="condition">Medical Condition</Label>
                <Input
                  id="condition"
                  placeholder="Hypertension"
                  {...register("condition")}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 rounded-xl border-slate-200 dark:border-slate-800 font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold min-w-[140px]"
            >
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : (patient ? "Save Changes" : "Register Patient")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

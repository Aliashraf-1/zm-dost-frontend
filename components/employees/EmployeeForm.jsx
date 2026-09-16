"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import Image from "next/image";
import { getImageUrl } from "@/lib/imageHelper";
import { useSettings } from "@/context/SettingsContext";
import {
  User,
  Save,
  X,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Calendar,
  Wallet,
  AlertTriangle,
  Upload,
  Trash2,
  Clock,
  Settings,
} from "lucide-react";

export default function EmployeeForm({
  initialData = null,
  mode = "create",
  onSubmit,
  onCancel,
}) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const { settings, loading: settingsLoading } = useSettings();
  const appliedSettingsDefaults = useRef(false);

  const [form, setForm] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    cnic: initialData?.cnic || "",
    designation: initialData?.designation || "",
    department: initialData?.department || "Operations",
    joiningDate: initialData?.joiningDate || "",
    salary: initialData?.salary || "",
    status: initialData?.status || "Active",
    address: initialData?.address || "",
    emergencyContact: initialData?.emergencyContact || "",
    emergencyName: initialData?.emergencyName || "",
    image: initialData?.image || null,
    role: initialData?.role || "employee",
  canManageLeads: initialData?.canManageLeads || false,
  hasLogin: initialData?.hasLogin || false,

    // ✅ Time Table / Shift Timing
    shiftTiming: {
      startTime: initialData?.shiftTiming?.startTime ?? "09:00",
      endTime: initialData?.shiftTiming?.endTime ?? "17:00",
      graceMinutes: initialData?.shiftTiming?.graceMinutes ?? 30,
      weeklyOff: initialData?.shiftTiming?.weeklyOff ?? "Friday",
      monthlyLeaves: initialData?.shiftTiming?.monthlyLeaves ?? 1,
    },
    // ✅ Attendance Settings (per employee)
    attendanceSettings: {
      leaveDeduction: initialData?.attendanceSettings?.leaveDeduction ?? 500,
      lateDeduction: initialData?.attendanceSettings?.lateDeduction ?? 10,
      taskFailureDeduction: initialData?.attendanceSettings?.taskFailureDeduction ?? 1000,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(initialData?.image || null);

  useEffect(() => {
    if (isEdit || settingsLoading || appliedSettingsDefaults.current) return;
    const employeeDefaults = settings?.employee;
    if (!employeeDefaults) return;

    const timer = window.setTimeout(() => {
      setForm((prev) => ({
        ...prev,
        shiftTiming: {
          ...prev.shiftTiming,
          graceMinutes: employeeDefaults.graceMinutes ?? prev.shiftTiming.graceMinutes,
          weeklyOff: employeeDefaults.weeklyOffDay ?? prev.shiftTiming.weeklyOff,
          monthlyLeaves: employeeDefaults.monthlyPaidLeaves ?? prev.shiftTiming.monthlyLeaves,
        },
        attendanceSettings: {
          ...prev.attendanceSettings,
          leaveDeduction: employeeDefaults.defaultLeaveDeduction ?? prev.attendanceSettings.leaveDeduction,
          lateDeduction: employeeDefaults.defaultLateDeduction ?? prev.attendanceSettings.lateDeduction,
          taskFailureDeduction: employeeDefaults.defaultTaskFailureDeduction ?? prev.attendanceSettings.taskFailureDeduction,
        },
      }));
      appliedSettingsDefaults.current = true;
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isEdit, settings, settingsLoading]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  // ✅ Handle Shift Timing Changes
  const handleShiftTimingChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      shiftTiming: {
        ...prev.shiftTiming,
        [name]: value,
      },
    }));
  };

  // ✅ Handle Attendance Settings Changes
  const handleAttendanceSettingsChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      attendanceSettings: {
        ...prev.attendanceSettings,
        [name]: Number(value) || 0,
      },
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
    setForm((prev) => ({ ...prev, image: file }));
    e.target.value = "";
  };

  const removeImage = () => {
    setImagePreview(null);
    setForm((prev) => ({ ...prev, image: null }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.name || !form.email || !form.phone || !form.salary || !form.cnic) {
    setError("Please fill in all required fields.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const employeeData = {
      ...form,
      salary: Number(form.salary),
      joiningDate: form.joiningDate || new Date().toISOString().split("T")[0],
      // ✅ Remove attendance and salaryHistory - let backend handle defaults
      // attendance: initialData?.attendance || [],
      // salaryHistory: initialData?.salaryHistory || [],
      shiftTiming: form.shiftTiming,
      attendanceSettings: form.attendanceSettings,
    };

    // ✅ Delete these fields so backend uses schema defaults
    delete employeeData.attendance;
    delete employeeData.salaryHistory;

    if (onSubmit) {
      await onSubmit(employeeData);
    } else {
      console.log("Employee Data:", employeeData);
      await new Promise((resolve) => setTimeout(resolve, 800));
      router.push("/dashboard/employees");
    }
  } catch (error) {
    console.error(error);
    setError("Something went wrong while saving the employee.");
  } finally {
    setLoading(false);
  }
};

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      router.push("/dashboard/employees");
    }
  };

  const departments = [
    "Operations",
    "Finance",
    "Maintenance",
    "Security",
    "HR",
    "Marketing",
    "Office",
    "Management",
    "IT",
    "Sales",
    "Others",
  ];

  const weeklyOffOptions = ["Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

  


  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border bg-card"
    >
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border p-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <User size={22} />
        </div>
        <div>
          <h2 className="font-semibold">
            {isEdit ? "Edit Employee" : "Add New Employee"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage employee information, employment details, and shift timing.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Fields */}
    <div className="grid gap-5 p-6 md:grid-cols-2">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Full Name *
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Email Address *
          </label>
          <div className="relative">
            <Mail
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="employee@company.com"
              required
              className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Phone Number *
          </label>
          <div className="relative">
            <Phone
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="0300-1234567"
              required
              className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
          </div>
        </div>

        {/* CNIC */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            CNIC
          </label>
              <input
        name="cnic"
        value={form.cnic}
        onChange={handleChange}
        placeholder="37405-1234567-1"
        required   // ✅ ADD THIS
        className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
      />
           </div>
        {/* Designation */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Designation *
          </label>
          <div className="relative">
            <Briefcase
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="e.g. Property Manager"
              required
              className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Department
          </label>
          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Joining Date */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Joining Date
          </label>
          <div className="relative">
            <Calendar
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
       <input
          type="date"
          name="joiningDate"
          value={form.joiningDate}
          onChange={handleChange}
          required   // ✅ ADD THIS
          className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm text-card-foreground outline-none focus:border-indigo-500"
        />
          </div>
        </div>

        {/* Salary */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Monthly Salary *
          </label>
          <div className="relative">
            <Wallet
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="number"
              min="0"
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="75000"
              required
              className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
          <div>
  <label className="mb-2 block text-sm font-medium text-card-foreground">
    Role
  </label>
  <select
    name="role"
    value={form.role}
    onChange={handleChange}
    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
  >
    <option value="employee">Employee</option>
    <option value="lead_manager">Lead Manager</option>
    <option value="moderator">Moderator</option>
    <option value="admin">Admin</option>
  </select>
</div>

<div>
  <label className="mb-2 block text-sm font-medium text-card-foreground">
    Lead Management
  </label>
  <select
    name="canManageLeads"
    value={form.canManageLeads ? "true" : "false"}
    onChange={(e) => setForm({ ...form, canManageLeads: e.target.value === "true" })}
    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
  >
    <option value="false">Disabled</option>
    <option value="true">Enabled (Lead Manager)</option>
  </select>
</div>


        {/* Address */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Address
          </label>
          <div className="relative">
            <MapPin
              size={17}
              className="absolute left-4 top-4 text-muted-foreground"
            />
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter full address"
              rows="2"
              className="w-full rounded-xl border border-border bg-input py-3 pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Emergency Contact Name
          </label>
          <input
            name="emergencyName"
            value={form.emergencyName}
            onChange={handleChange}
            placeholder="Emergency contact person"
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Emergency Contact Number
          </label>
          <input
            name="emergencyContact"
            value={form.emergencyContact}
            onChange={handleChange}
            placeholder="0312-7654321"
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
          />
        </div>

        {/* Profile Image */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-card-foreground">
            Profile Picture
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              Optional
            </span>
          </label>

          {imagePreview ? (
          <div className="relative h-40 w-40 overflow-hidden rounded-2xl border border-border bg-input">
            {typeof imagePreview === 'string' && !imagePreview.startsWith('blob:') ? (
              <Image
                src={getImageUrl(imagePreview)}
                alt="Profile preview"
                width={160}
                height={160}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={imagePreview}
                alt="Profile preview"
                width={160}
                height={160}
                className="h-full w-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={removeImage}
              className="absolute right-2 top-2 rounded-lg bg-black/70 p-2 text-white transition hover:bg-red-500"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ) : (
          <label className="flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted transition hover:border-indigo-500 hover:bg-indigo-500/5">
            <Upload size={28} className="text-muted-foreground" />
            <span className="mt-2 text-xs text-muted-foreground">Upload Picture</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        )}
        </div>
      </div>

      {/* ==================================================
          SHIFT TIMING / TIME TABLE SECTION
      ================================================== */}
      <div className="border-t border-border p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
            <Clock size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Shift Timing & Time Table</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Set employee work schedule, grace time, and leave policies.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Start Time */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Shift Start Time
            </label>
            <input
              type="time"
              name="startTime"
              value={form.shiftTiming.startTime}
              onChange={handleShiftTimingChange}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
            />
          </div>

          {/* End Time */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Shift End Time
            </label>
            <input
              type="time"
              name="endTime"
              value={form.shiftTiming.endTime}
              onChange={handleShiftTimingChange}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
            />
          </div>

          {/* Grace Minutes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Grace Minutes
              <span className="ml-2 text-xs text-muted-foreground">(no deduction)</span>
            </label>
            <input
              type="number"
              min="0"
              name="graceMinutes"
              value={form.shiftTiming.graceMinutes}
              onChange={handleShiftTimingChange}
              placeholder="30"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Minutes allowed after shift start without deduction
            </p>
          </div>

          {/* Weekly Off */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Weekly Off Day
            </label>
            <select
              name="weeklyOff"
              value={form.shiftTiming.weeklyOff}
              onChange={handleShiftTimingChange}
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-card-foreground outline-none focus:border-indigo-500"
            >
              {weeklyOffOptions.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              No deduction for weekly off days
            </p>
          </div>

          {/* Monthly Leaves */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Monthly Paid Leaves
              <span className="ml-2 text-xs text-muted-foreground">(no deduction)</span>
            </label>
            <input
              type="number"
              min="0"
              name="monthlyLeaves"
              value={form.shiftTiming.monthlyLeaves}
              onChange={handleShiftTimingChange}
              placeholder="1"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Number of paid leaves allowed per month (excluding weekly off)
            </p>
          </div>
        </div>
      </div>

      {/* ==================================================
          DEDUCTION SETTINGS
      ================================================== */}
      <div className="border-t border-border p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="font-semibold">Deduction Settings</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Set deduction rates for this employee.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Leave Deduction */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Leave Deduction (Rs.)
              <span className="ml-2 text-xs text-muted-foreground">per day</span>
            </label>
            <input
              type="number"
              min="0"
              name="leaveDeduction"
              value={form.attendanceSettings.leaveDeduction}
              onChange={handleAttendanceSettingsChange}
              placeholder="500"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Deduction per leave day (after paid leaves)
            </p>
          </div>

          {/* Late Deduction */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Late Deduction (Rs.)
              <span className="ml-2 text-xs text-muted-foreground">per minute</span>
            </label>
            <input
              type="number"
              min="0"
              name="lateDeduction"
              value={form.attendanceSettings.lateDeduction}
              onChange={handleAttendanceSettingsChange}
              placeholder="10"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Deduction per late minute (after grace time)
            </p>
          </div>

          {/* Task Failure Deduction */}
          <div>
            <label className="mb-2 block text-sm font-medium text-card-foreground">
              Task Failure Deduction (Rs.)
              <span className="ml-2 text-xs text-muted-foreground">per task</span>
            </label>
            <input
              type="number"
              min="0"
              name="taskFailureDeduction"
              value={form.attendanceSettings.taskFailureDeduction}
              onChange={handleAttendanceSettingsChange}
              placeholder="1000"
              className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-indigo-500"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Default deduction per failed task
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-3 border-t border-border p-6">
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          <X size={17} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={17} />
          {loading ? "Saving..." : isEdit ? "Update Employee" : "Save Employee"}
        </button>
      </div>
    </form>
  );
}

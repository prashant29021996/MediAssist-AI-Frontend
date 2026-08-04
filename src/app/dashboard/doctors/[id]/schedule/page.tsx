"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { schedulingApi, DoctorDaySchedule, OperatingHourShift } from "@/lib/api";
import { Button, Card, CardBody, CardHeader, Input, Alert } from "@/components/ui";

const DAYS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const MAX_SHIFTS = 10;

export default function DoctorSchedulePage() {
  const router = useRouter();
  const params = useParams();
  const doctorId = params.id as string;

  const [days, setDays] = useState<DoctorDaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await schedulingApi.getDoctorSchedule(doctorId);
      setDays(res.data.days);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load doctor schedule");
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleToggleOff = (dayIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      next[dayIndex] = {
        ...next[dayIndex],
        is_off: !next[dayIndex].is_off,
        shifts: !next[dayIndex].is_off ? [] : next[dayIndex].shifts,
      };
      return next;
    });
  };

  const handleAddShift = (dayIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      const day = next[dayIndex];
      if (day.shifts.length >= MAX_SHIFTS) return prev;
      day.shifts = [...day.shifts, { start_time: "09:00", end_time: "17:00" }];
      return next;
    });
  };

  const handleRemoveShift = (dayIndex: number, shiftIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      next[dayIndex].shifts = next[dayIndex].shifts.filter((_, i) => i !== shiftIndex);
      return next;
    });
  };

  const handleShiftChange = (dayIndex: number, shiftIndex: number, field: keyof OperatingHourShift, value: string) => {
    setDays((prev) => {
      const next = [...prev];
      next[dayIndex].shifts[shiftIndex] = {
        ...next[dayIndex].shifts[shiftIndex],
        [field]: value,
      };
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await schedulingApi.replaceDoctorSchedule(doctorId, { days });
      setSuccess("Doctor schedule saved successfully");
      await loadSchedule();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to save doctor schedule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Loading doctor schedule...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push(`/dashboard/doctors/${doctorId}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
        >
          <span>←</span> Back to Doctor
        </button>
        <h2 className="text-xl font-semibold text-gray-900">Doctor Working Schedule</h2>
        <p className="mt-1 text-sm text-gray-600">
          Configure the doctor's weekly working hours. All shifts must fit within the clinic's operating hours.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>
          <p className="text-sm text-gray-500 mt-1">
            Multiple shifts per day are supported. Days off override the schedule.
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {DAYS.map((day, dayIndex) => {
              const schedule = days.find((d) => d.day_of_week === day.value);
              const isOff = schedule?.is_off ?? true;
              const shifts = schedule?.shifts ?? [];

              return (
                <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{day.label}</h4>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={isOff}
                          onChange={() => handleToggleOff(dayIndex)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Day Off
                      </label>
                    </div>
                    {!isOff && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddShift(dayIndex)}
                        disabled={shifts.length >= MAX_SHIFTS}
                      >
                        + Add Shift
                      </Button>
                    )}
                  </div>

                  {isOff ? (
                    <p className="text-sm text-gray-500">Day off — no appointments available</p>
                  ) : (
                    <div className="space-y-2">
                      {shifts.length === 0 && (
                        <p className="text-sm text-gray-500">No shifts configured. Add a shift to make this a working day.</p>
                      )}
                      {shifts.map((shift, shiftIndex) => (
                        <div key={shiftIndex} className="flex items-center gap-3">
                          <Input
                            type="time"
                            value={shift.start_time}
                            onChange={(e) => handleShiftChange(dayIndex, shiftIndex, "start_time", e.target.value)}
                            className="w-32"
                            aria-label={`${day.label} shift ${shiftIndex + 1} start time`}
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={shift.end_time}
                            onChange={(e) => handleShiftChange(dayIndex, shiftIndex, "end_time", e.target.value)}
                            className="w-32"
                            aria-label={`${day.label} shift ${shiftIndex + 1} end time`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveShift(dayIndex, shiftIndex)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={loadSchedule} disabled={saving}>
              Reset
            </Button>
            <Button type="button" onClick={handleSave} loading={saving} disabled={saving}>
              {saving ? "Saving..." : "Save Schedule"}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
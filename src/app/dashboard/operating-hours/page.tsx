"use client";

import { useEffect, useState, useCallback } from "react";
import { schedulingApi, DaySchedule, OperatingHourShift } from "@/lib/api";
import { Button, Card, CardBody, CardHeader, Input, Alert } from "@/components/ui";

const DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];

const MAX_SHIFTS = 10;

export default function OperatingHoursPage() {
  const [days, setDays] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await schedulingApi.getOperatingHours();
      setDays(res.data.days);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to load operating hours");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleToggleClosed = (dayOfWeek: string) => {
    setDays((prev) => {
      const idx = prev.findIndex((d) => d.day_of_week === dayOfWeek);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = {
        ...next[idx],
        is_closed: !next[idx].is_closed,
        shifts: !next[idx].is_closed ? [] : next[idx].shifts,
      };
      return next;
    });
  };

  const handleAddShift = (dayOfWeek: string) => {
    setDays((prev) => {
      const idx = prev.findIndex((d) => d.day_of_week === dayOfWeek);
      if (idx === -1) return prev;
      const next = [...prev];
      const day = next[idx];
      if (day.shifts.length >= MAX_SHIFTS) return prev;
      day.shifts = [...day.shifts, { start_time: "09:00", end_time: "17:00" }];
      return next;
    });
  };

  const handleRemoveShift = (dayOfWeek: string, shiftIndex: number) => {
    setDays((prev) => {
      const idx = prev.findIndex((d) => d.day_of_week === dayOfWeek);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx].shifts = next[idx].shifts.filter((_, i) => i !== shiftIndex);
      return next;
    });
  };

  const handleShiftChange = (dayOfWeek: string, shiftIndex: number, field: keyof OperatingHourShift, value: string) => {
    setDays((prev) => {
      const idx = prev.findIndex((d) => d.day_of_week === dayOfWeek);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx].shifts[shiftIndex] = {
        ...next[idx].shifts[shiftIndex],
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
      await schedulingApi.replaceOperatingHours({ days });
      setSuccess("Operating hours saved successfully");
      // Reload to get server-side sorted/validated data
      await loadSchedule();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to save operating hours");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">Loading operating hours...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Clinic Operating Hours</h2>
        <p className="mt-1 text-sm text-gray-600">
          Define when your clinic is open. Doctor schedules and appointments must fit within these hours.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900">Weekly Schedule</h3>
          <p className="text-sm text-gray-500 mt-1">
            Configure operating hours for each day. Multiple shifts per day are supported.
          </p>
        </CardHeader>
        <CardBody>
          <div className="space-y-6">
            {DAYS.map((day) => {
              const schedule = days.find((d) => d.day_of_week === day.value);
              const isClosed = schedule?.is_closed ?? true;
              const shifts = schedule?.shifts ?? [];

              return (
                <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{day.label}</h4>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={isClosed}
                          onChange={() => handleToggleClosed(day.value)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Closed
                      </label>
                    </div>
                    {!isClosed && (
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => handleAddShift(day.value)}
                        disabled={shifts.length >= MAX_SHIFTS}
                      >
                        + Add Shift
                      </Button>
                    )}
                  </div>

                  {isClosed ? (
                    <p className="text-sm text-gray-500">Closed — no appointments available</p>
                  ) : (
                    <div className="space-y-2">
                      {shifts.length === 0 && (
                        <p className="text-sm text-gray-500">No shifts configured. Add a shift to open this day.</p>
                      )}
                      {shifts.map((shift, shiftIndex) => (
                        <div key={shiftIndex} className="flex items-center gap-3">
                          <Input
                            type="time"
                            value={shift.start_time}
                            onChange={(e) => handleShiftChange(day.value, shiftIndex, "start_time", e.target.value)}
                            className="w-32"
                            aria-label={`${day.label} shift ${shiftIndex + 1} start time`}
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={shift.end_time}
                            onChange={(e) => handleShiftChange(day.value, shiftIndex, "end_time", e.target.value)}
                            className="w-32"
                            aria-label={`${day.label} shift ${shiftIndex + 1} end time`}
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveShift(day.value, shiftIndex)}
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
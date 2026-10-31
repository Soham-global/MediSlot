package com.hospital.slot.admin.dto;

import java.time.LocalTime;

public record AdminDoctorScheduleEntryResponse(
        int dayOfWeek,
        String dayName,
        LocalTime startTime,
        LocalTime endTime,
        int slotDurationMinutes
) {
}

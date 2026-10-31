package com.hospital.doctor.admin.dto;

import java.time.LocalTime;

public record AdminDoctorScheduleResponse(
        int dayOfWeek,
        String dayName,
        LocalTime startTime,
        LocalTime endTime,
        int slotDurationMinutes
) {
}

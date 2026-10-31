package com.hospital.doctor.dto;

import java.time.LocalTime;

public record DoctorScheduleResponse(
        int dayOfWeek,
        String dayName,
        LocalTime startTime,
        LocalTime endTime,
        int slotDurationMinutes
) {
}

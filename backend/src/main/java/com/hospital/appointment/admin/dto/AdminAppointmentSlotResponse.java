package com.hospital.appointment.admin.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AdminAppointmentSlotResponse(
        Long id,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime
) {
}

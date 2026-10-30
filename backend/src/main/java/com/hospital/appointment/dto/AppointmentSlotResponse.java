package com.hospital.appointment.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AppointmentSlotResponse(
        Long id,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime
) {
}

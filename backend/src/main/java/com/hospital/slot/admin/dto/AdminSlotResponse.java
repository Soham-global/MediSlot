package com.hospital.slot.admin.dto;

import com.hospital.slot.SlotStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record AdminSlotResponse(
        Long id,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        SlotStatus status,
        String blockReason,
        AdminSlotAppointmentResponse appointment
) {
}

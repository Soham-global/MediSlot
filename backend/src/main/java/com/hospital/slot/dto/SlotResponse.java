package com.hospital.slot.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SlotResponse(
        Long id,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime
) {
}

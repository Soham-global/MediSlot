package com.hospital.slot.admin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record BlockSlotsRequest(
        @NotNull(message = "From date is required")
        LocalDate fromDate,

        @NotNull(message = "To date is required")
        LocalDate toDate,

        LocalTime startTime,

        LocalTime endTime,

        @NotBlank(message = "Reason is required")
        @Size(max = 200, message = "Reason must not exceed 200 characters")
        String reason
) {
}

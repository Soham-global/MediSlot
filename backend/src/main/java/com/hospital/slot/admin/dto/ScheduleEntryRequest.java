package com.hospital.slot.admin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record ScheduleEntryRequest(
        @NotNull(message = "Day of week is required")
        @Min(value = 1, message = "Day of week must be between 1 and 7")
        @Max(value = 7, message = "Day of week must be between 1 and 7")
        Integer dayOfWeek,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @NotNull(message = "Slot duration is required")
        @Min(value = 5, message = "Slot duration must be between 5 and 120 minutes")
        @Max(value = 120, message = "Slot duration must be between 5 and 120 minutes")
        Integer slotDurationMinutes
) {
}

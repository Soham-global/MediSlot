package com.hospital.slot.admin.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record ReplaceDoctorScheduleRequest(
        @NotNull(message = "Schedules are required")
        @Valid
        List<ScheduleEntryRequest> schedules
) {
}

package com.hospital.appointment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAppointmentRequest(
        @NotNull(message = "Slot ID is required")
        Long slotId,

        @Size(max = 500, message = "Reason must not exceed 500 characters")
        String reason
) {
}

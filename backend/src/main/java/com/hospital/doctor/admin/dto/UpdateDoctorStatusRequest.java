package com.hospital.doctor.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public record UpdateDoctorStatusRequest(
        @JsonProperty("isActive")
        @NotNull(message = "isActive is required")
        Boolean isActive
) {
}

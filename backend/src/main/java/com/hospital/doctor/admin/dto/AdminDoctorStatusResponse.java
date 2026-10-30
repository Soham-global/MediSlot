package com.hospital.doctor.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AdminDoctorStatusResponse(
        Long id,
        @JsonProperty("isActive") boolean isActive,
        long upcomingAppointments
) {
}

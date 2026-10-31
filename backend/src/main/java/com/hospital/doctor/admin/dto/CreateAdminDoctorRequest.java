package com.hospital.doctor.admin.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateAdminDoctorRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 120, message = "Name must not exceed 120 characters")
        String name,

        @NotNull(message = "Department ID is required")
        Long departmentId,

        @NotBlank(message = "Specialization is required")
        @Size(max = 120, message = "Specialization must not exceed 120 characters")
        String specialization,

        @NotBlank(message = "Qualification is required")
        @Size(max = 150, message = "Qualification must not exceed 150 characters")
        String qualification,

        @NotNull(message = "Experience years is required")
        @Min(value = 0, message = "Experience years must be zero or greater")
        Integer experienceYears
) {
}

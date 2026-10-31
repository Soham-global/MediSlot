package com.hospital.doctor.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AdminDoctorResponse(
        Long id,
        String name,
        String specialization,
        String qualification,
        int experienceYears,
        @JsonProperty("isActive") boolean isActive,
        AdminDoctorDepartmentResponse department
) {
}

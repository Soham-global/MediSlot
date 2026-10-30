package com.hospital.doctor.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record AdminDoctorDetailResponse(
        Long id,
        String name,
        String specialization,
        String qualification,
        int experienceYears,
        @JsonProperty("isActive") boolean isActive,
        AdminDoctorDepartmentResponse department,
        List<AdminDoctorScheduleResponse> weeklyTimings
) {
}

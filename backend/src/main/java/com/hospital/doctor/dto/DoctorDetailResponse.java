package com.hospital.doctor.dto;

import java.util.List;

public record DoctorDetailResponse(
        Long id,
        String name,
        String specialization,
        String qualification,
        int experienceYears,
        DoctorDepartmentResponse department,
        DoctorHospitalResponse hospital,
        List<DoctorScheduleResponse> weeklyTimings
) {
}

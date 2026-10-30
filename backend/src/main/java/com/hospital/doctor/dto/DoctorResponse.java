package com.hospital.doctor.dto;

public record DoctorResponse(
        Long id,
        String name,
        String specialization,
        String qualification,
        int experienceYears,
        DoctorDepartmentResponse department,
        DoctorHospitalResponse hospital
) {
}

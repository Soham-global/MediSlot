package com.hospital.appointment.dto;

public record AppointmentDoctorResponse(
        Long id,
        String name,
        String specialization,
        AppointmentDepartmentResponse department
) {
}

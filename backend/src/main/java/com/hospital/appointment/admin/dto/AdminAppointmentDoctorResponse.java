package com.hospital.appointment.admin.dto;

public record AdminAppointmentDoctorResponse(
        Long id,
        String name,
        String specialization,
        AdminAppointmentDepartmentResponse department
) {
}

package com.hospital.appointment.admin.dto;

public record AdminAppointmentEmployeeResponse(
        Long id,
        String employeeCode,
        String name,
        String email,
        String phone,
        String plantLocation
) {
}

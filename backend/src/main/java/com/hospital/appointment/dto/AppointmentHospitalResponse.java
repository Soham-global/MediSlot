package com.hospital.appointment.dto;

public record AppointmentHospitalResponse(
        Long id,
        String name,
        String address,
        String city,
        String phone
) {
}

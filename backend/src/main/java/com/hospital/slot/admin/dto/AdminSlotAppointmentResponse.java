package com.hospital.slot.admin.dto;

import com.hospital.appointment.AppointmentStatus;

public record AdminSlotAppointmentResponse(
        Long id,
        AppointmentStatus status,
        String employeeName,
        String employeeCode
) {
}

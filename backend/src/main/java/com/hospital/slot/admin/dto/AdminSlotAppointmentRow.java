package com.hospital.slot.admin.dto;

import com.hospital.appointment.AppointmentStatus;

public record AdminSlotAppointmentRow(
        Long slotId,
        Long appointmentId,
        AppointmentStatus status,
        String employeeName,
        String employeeCode
) {
}

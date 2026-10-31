package com.hospital.appointment.admin.dto;

import com.hospital.appointment.AppointmentStatus;
import com.hospital.appointment.CancelledBy;

import java.time.LocalDateTime;

public record AdminAppointmentResponse(
        Long id,
        AppointmentStatus status,
        String reason,
        LocalDateTime bookedAt,
        LocalDateTime updatedAt,
        CancelledBy cancelledBy,
        AdminAppointmentEmployeeResponse employee,
        AdminAppointmentDoctorResponse doctor,
        AdminAppointmentSlotResponse slot
) {
}

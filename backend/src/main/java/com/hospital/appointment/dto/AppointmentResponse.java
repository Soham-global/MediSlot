package com.hospital.appointment.dto;

import com.hospital.appointment.AppointmentStatus;
import com.hospital.appointment.CancelledBy;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        AppointmentStatus status,
        String reason,
        LocalDateTime bookedAt,
        CancelledBy cancelledBy,
        AppointmentDoctorResponse doctor,
        AppointmentHospitalResponse hospital,
        AppointmentSlotResponse slot
) {
}

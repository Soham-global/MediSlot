package com.hospital.symptom.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SuggestedDoctorRow(
        Long doctorId,
        String name,
        String specialization,
        int experienceYears,
        Long hospitalId,
        String hospitalName,
        String hospitalCity,
        Long slotId,
        LocalDate slotDate,
        LocalTime slotStartTime
) {
}

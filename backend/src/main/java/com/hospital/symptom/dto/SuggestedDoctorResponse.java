package com.hospital.symptom.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record SuggestedDoctorResponse(
        Long id,
        String name,
        String specialization,
        int experienceYears,
        Hospital hospital,
        NextAvailableSlot nextAvailableSlot
) {

    public record Hospital(
            Long id,
            String name,
            String city
    ) {
    }

    public record NextAvailableSlot(
            Long id,
            LocalDate date,
            LocalTime startTime
    ) {
    }
}

package com.hospital.auth.dto;

public record AdminProfileResponse(
        Long id,
        String name,
        String email,
        String role,
        HospitalSummaryResponse hospital
) {
}

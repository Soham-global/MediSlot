package com.hospital.hospital.admin.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalTime;

public record AdminHospitalResponse(
        Long id,
        String name,
        String address,
        String city,
        String phone,
        String email,
        LocalTime openingTime,
        LocalTime closingTime,
        @JsonProperty("isActive") boolean isActive
) {
}

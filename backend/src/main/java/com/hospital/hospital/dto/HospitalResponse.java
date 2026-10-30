package com.hospital.hospital.dto;

import java.time.LocalTime;

public record HospitalResponse(
        Long id,
        String name,
        String address,
        String city,
        String phone,
        String email,
        LocalTime openingTime,
        LocalTime closingTime
) {
}

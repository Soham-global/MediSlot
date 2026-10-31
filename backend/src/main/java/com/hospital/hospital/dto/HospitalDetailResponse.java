package com.hospital.hospital.dto;

import java.time.LocalTime;
import java.util.List;

public record HospitalDetailResponse(
        Long id,
        String name,
        String address,
        String city,
        String phone,
        String email,
        LocalTime openingTime,
        LocalTime closingTime,
        List<DepartmentResponse> departments
) {
}

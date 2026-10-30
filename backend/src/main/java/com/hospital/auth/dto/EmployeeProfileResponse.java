package com.hospital.auth.dto;

public record EmployeeProfileResponse(
        Long id,
        String employeeCode,
        String name,
        String email,
        String phone,
        String plantLocation
) {
}

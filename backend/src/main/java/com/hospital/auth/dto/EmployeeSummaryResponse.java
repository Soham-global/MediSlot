package com.hospital.auth.dto;

public record EmployeeSummaryResponse(
        Long id,
        String employeeCode,
        String name,
        String email
) {
}

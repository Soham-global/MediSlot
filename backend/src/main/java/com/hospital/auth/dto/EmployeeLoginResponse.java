package com.hospital.auth.dto;

public record EmployeeLoginResponse(
        String token,
        String tokenType,
        long expiresInMinutes,
        EmployeeSummaryResponse employee
) {
}

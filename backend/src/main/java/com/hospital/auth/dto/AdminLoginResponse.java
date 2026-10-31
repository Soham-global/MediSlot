package com.hospital.auth.dto;

public record AdminLoginResponse(
        String token,
        String tokenType,
        long expiresInMinutes,
        AdminProfileResponse admin
) {
}

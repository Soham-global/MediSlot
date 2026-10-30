package com.hospital.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiryMinutes;

    public JwtService(JwtProperties properties) {
        if (properties.getSecret() == null || properties.getSecret().isBlank()) {
            throw new IllegalStateException("JWT secret must be configured");
        }
        if (properties.getExpiryMinutes() <= 0) {
            throw new IllegalStateException("JWT expiry minutes must be greater than zero");
        }

        this.secretKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
        this.expiryMinutes = properties.getExpiryMinutes();
    }

    public String generateToken(Long userId, UserRole role, Long hospitalId) {
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(expiryMinutes, ChronoUnit.MINUTES);

        JwtBuilder builder = Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("role", role.name())
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey);

        if (hospitalId != null) {
            builder.claim("hospitalId", hospitalId);
        }

        return builder.compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public long getExpiryMinutes() {
        return expiryMinutes;
    }
}

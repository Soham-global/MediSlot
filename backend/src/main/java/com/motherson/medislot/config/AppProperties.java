package com.motherson.medislot.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String timezone,
        int slotHorizonDays,
        boolean seedDemoData,
        Jwt jwt,
        Cloudinary cloudinary,
        Cors cors,
        Bootstrap bootstrap) {

    public record Jwt(String secret, long expirationMinutes) {}

    public record Cloudinary(String cloudName, String apiKey, String apiSecret) {}

    public record Cors(List<String> allowedOrigins) {}

    public record Bootstrap(String superAdminName, String superAdminEmail, String superAdminPassword) {}
}

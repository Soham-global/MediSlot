package com.hospital.common;

import org.springframework.http.HttpStatus;

import java.time.OffsetDateTime;
import java.time.ZoneId;

public record ErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String error,
        String message,
        String path
) {

    private static final ZoneId KOLKATA = ZoneId.of("Asia/Kolkata");

    public static ErrorResponse of(HttpStatus httpStatus, String message, String path) {
        return new ErrorResponse(
                OffsetDateTime.now(KOLKATA),
                httpStatus.value(),
                httpStatus.getReasonPhrase(),
                message,
                path
        );
    }
}

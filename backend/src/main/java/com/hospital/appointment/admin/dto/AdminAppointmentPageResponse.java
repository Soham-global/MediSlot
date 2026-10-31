package com.hospital.appointment.admin.dto;

import java.util.List;

public record AdminAppointmentPageResponse(
        List<AdminAppointmentResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}

package com.hospital.hospital.admin.dto;

public record AdminDashboardResponse(
        String hospitalName,
        long todayAppointments,
        long pendingAppointments,
        long completedToday,
        long totalDoctors,
        long doctorsAvailableToday
) {
}

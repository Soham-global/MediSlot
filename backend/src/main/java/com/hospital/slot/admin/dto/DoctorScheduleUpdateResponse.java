package com.hospital.slot.admin.dto;

import java.util.List;

public record DoctorScheduleUpdateResponse(
        Long doctorId,
        List<AdminDoctorScheduleEntryResponse> schedules,
        int slotsCreated,
        int slotsRemoved,
        long bookedSlotsKept
) {
}

package com.hospital.slot.service;

import com.hospital.common.BadRequestException;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.doctor.DoctorRepository;
import com.hospital.slot.Slot;
import com.hospital.slot.SlotRepository;
import com.hospital.slot.SlotStatus;
import com.hospital.slot.dto.SlotResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;

@Service
public class SlotService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");

    private final SlotRepository slotRepository;
    private final DoctorRepository doctorRepository;

    public SlotService(SlotRepository slotRepository, DoctorRepository doctorRepository) {
        this.slotRepository = slotRepository;
        this.doctorRepository = doctorRepository;
    }

    @Transactional(readOnly = true)
    public List<SlotResponse> getAvailableSlots(Long doctorId, LocalDate date) {
        if (date == null) {
            throw new BadRequestException("Date is required");
        }

        LocalDateTime now = LocalDateTime.now(APP_ZONE);
        LocalDate today = now.toLocalDate();

        if (date.isBefore(today)) {
            throw new BadRequestException("Date cannot be in the past");
        }

        doctorRepository.findActiveByIdWithDetails(doctorId)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        LocalTime earliestStart = date.equals(today) ? now.toLocalTime() : LocalTime.MIN;

        return slotRepository.findAvailableSlotsForDoctor(
                        doctorId,
                        date,
                        SlotStatus.AVAILABLE,
                        earliestStart
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private SlotResponse toResponse(Slot slot) {
        return new SlotResponse(
                slot.getId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime()
        );
    }
}

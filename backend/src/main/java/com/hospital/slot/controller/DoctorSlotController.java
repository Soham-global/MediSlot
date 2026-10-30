package com.hospital.slot.controller;

import com.hospital.slot.dto.SlotResponse;
import com.hospital.slot.service.SlotService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/doctors")
public class DoctorSlotController {

    private final SlotService slotService;

    public DoctorSlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    @GetMapping("/{id}/slots")
    public List<SlotResponse> getAvailableSlots(
            @PathVariable Long id,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return slotService.getAvailableSlots(id, date);
    }
}

package com.hospital.slot.admin.controller;

import com.hospital.slot.admin.dto.AdminSlotResponse;
import com.hospital.slot.admin.dto.BlockSlotsRequest;
import com.hospital.slot.admin.dto.BlockSlotsResponse;
import com.hospital.slot.admin.dto.DoctorScheduleUpdateResponse;
import com.hospital.slot.admin.dto.ReplaceDoctorScheduleRequest;
import com.hospital.slot.admin.service.SlotAdminService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class SlotAdminController {

    private final SlotAdminService slotAdminService;

    public SlotAdminController(SlotAdminService slotAdminService) {
        this.slotAdminService = slotAdminService;
    }

    @PutMapping("/doctors/{id}/schedule")
    public DoctorScheduleUpdateResponse replaceSchedule(
            @PathVariable Long id,
            @Valid @RequestBody ReplaceDoctorScheduleRequest request
    ) {
        return slotAdminService.replaceSchedule(id, request);
    }

    @GetMapping("/doctors/{id}/slots")
    public List<AdminSlotResponse> getSlots(
            @PathVariable Long id,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return slotAdminService.getSlots(id, date);
    }

    @PostMapping("/doctors/{id}/slots/block")
    public BlockSlotsResponse blockSlots(
            @PathVariable Long id,
            @Valid @RequestBody BlockSlotsRequest request
    ) {
        return slotAdminService.blockSlots(id, request);
    }

    @PutMapping("/slots/{id}/unblock")
    public AdminSlotResponse unblockSlot(@PathVariable Long id) {
        return slotAdminService.unblockSlot(id);
    }
}

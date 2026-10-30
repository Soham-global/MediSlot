package com.hospital.slot.admin.service;

import com.hospital.doctor.Doctor;
import com.hospital.doctor.DoctorRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class SlotTopUpJob {

    private final DoctorRepository doctorRepository;
    private final SlotGenerationService slotGenerationService;

    public SlotTopUpJob(
            DoctorRepository doctorRepository,
            SlotGenerationService slotGenerationService
    ) {
        this.doctorRepository = doctorRepository;
        this.slotGenerationService = slotGenerationService;
    }

    @Scheduled(cron = "0 30 0 * * *", zone = "Asia/Kolkata")
    public void topUpSlots() {
        for (Doctor doctor : doctorRepository.findByActiveTrue()) {
            slotGenerationService.generateSlots(doctor);
        }
    }
}

package com.hospital.slot.admin.service;

import com.hospital.doctor.Doctor;
import com.hospital.doctor.DoctorSchedule;
import com.hospital.doctor.DoctorScheduleRepository;
import com.hospital.slot.Slot;
import com.hospital.slot.SlotRepository;
import com.hospital.slot.SlotStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class SlotGenerationService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    private static final int WINDOW_DAYS = 14;

    private final SlotRepository slotRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;

    public SlotGenerationService(
            SlotRepository slotRepository,
            DoctorScheduleRepository doctorScheduleRepository
    ) {
        this.slotRepository = slotRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
    }

    @Transactional
    public int generateSlots(Doctor doctor) {
        if (doctor == null || !doctor.isActive()) {
            return 0;
        }

        List<DoctorSchedule> schedules =
                doctorScheduleRepository.findByDoctorIdAndActiveTrue(doctor.getId());

        if (schedules.isEmpty()) {
            return 0;
        }

        LocalDateTime now = LocalDateTime.now(APP_ZONE);
        LocalDate firstDate = now.toLocalDate();
        LocalDate lastDate = firstDate.plusDays(WINDOW_DAYS - 1);

        Map<LocalDate, Set<LocalTime>> occupiedStarts = new HashMap<>();
        for (Slot slot : slotRepository.findByDoctorIdAndSlotDateBetween(
                doctor.getId(),
                firstDate,
                lastDate
        )) {
            occupiedStarts
                    .computeIfAbsent(slot.getSlotDate(), key -> new HashSet<>())
                    .add(slot.getStartTime());
        }

        List<Slot> slotsToCreate = new ArrayList<>();

        for (int offset = 0; offset < WINDOW_DAYS; offset++) {
            LocalDate date = firstDate.plusDays(offset);
            int dayOfWeek = date.getDayOfWeek().getValue();

            for (DoctorSchedule schedule : schedules) {
                if (schedule.getDayOfWeek() != dayOfWeek) {
                    continue;
                }

                int durationMinutes = schedule.getSlotDurationMinutes();
                if (durationMinutes <= 0) {
                    continue;
                }

                LocalTime cursor = schedule.getStartTime();
                while (!cursor.plusMinutes(durationMinutes).isAfter(schedule.getEndTime())) {
                    LocalTime endTime = cursor.plusMinutes(durationMinutes);
                    boolean alreadyStarted = date.equals(firstDate)
                            && cursor.isBefore(now.toLocalTime());

                    if (!alreadyStarted
                            && occupiedStarts
                            .computeIfAbsent(date, key -> new HashSet<>())
                            .add(cursor)) {
                        Slot slot = new Slot();
                        slot.setDoctor(doctor);
                        slot.setSlotDate(date);
                        slot.setStartTime(cursor);
                        slot.setEndTime(endTime);
                        slot.setStatus(SlotStatus.AVAILABLE);
                        slotsToCreate.add(slot);
                    }

                    cursor = endTime;
                }
            }
        }

        if (slotsToCreate.isEmpty()) {
            return 0;
        }

        slotRepository.saveAll(slotsToCreate);
        return slotsToCreate.size();
    }
}

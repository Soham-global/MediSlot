package com.hospital.slot;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByDoctorIdAndSlotDate(Long doctorId, LocalDate slotDate);

    List<Slot> findByDoctorIdAndSlotDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);

    Optional<Slot> findByDoctorIdAndSlotDateAndStartTime(Long doctorId, LocalDate slotDate, LocalTime startTime);

    List<Slot> findByStatus(SlotStatus status);
}

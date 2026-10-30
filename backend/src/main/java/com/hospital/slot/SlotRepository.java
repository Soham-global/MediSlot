package com.hospital.slot;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<Slot, Long> {

    List<Slot> findByDoctorIdAndSlotDate(Long doctorId, LocalDate slotDate);

    List<Slot> findByDoctorIdAndSlotDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);

    Optional<Slot> findByDoctorIdAndSlotDateAndStartTime(Long doctorId, LocalDate slotDate, LocalTime startTime);

    List<Slot> findByStatus(SlotStatus status);

    boolean existsByDoctorIdAndStatus(Long doctorId, SlotStatus status);

    @Modifying
    @Query("delete from Slot s where s.doctor.id = :doctorId")
    int deleteAllByDoctorId(@Param("doctorId") Long doctorId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from Slot s where s.id = :id")
    Optional<Slot> findByIdForUpdate(@Param("id") Long id);

    @Query("""
            select s
            from Slot s
            where s.doctor.id = :doctorId
              and s.slotDate = :slotDate
              and s.status = :status
              and s.startTime >= :earliestStart
            order by s.startTime asc
            """)
    List<Slot> findAvailableSlotsForDoctor(
            @Param("doctorId") Long doctorId,
            @Param("slotDate") LocalDate slotDate,
            @Param("status") SlotStatus status,
            @Param("earliestStart") LocalTime earliestStart
    );
}

package com.hospital.appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByEmployeeId(Long employeeId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByHospitalId(Long hospitalId);

    List<Appointment> findBySlotId(Long slotId);

    boolean existsBySlotIdAndStatusNot(Long slotId, AppointmentStatus status);

    @Query("""
            select a
            from Appointment a
            join fetch a.doctor
            join fetch a.doctor.department
            join fetch a.hospital
            join fetch a.slot
            where a.id = :id
              and a.employee.id = :employeeId
            """)
    Optional<Appointment> findDetailedByIdAndEmployeeId(
            @Param("id") Long id,
            @Param("employeeId") Long employeeId
    );

    @Query("""
            select a.slot.id
            from Appointment a
            where a.id = :id
              and a.employee.id = :employeeId
            """)
    Optional<Long> findSlotIdByIdAndEmployeeId(
            @Param("id") Long id,
            @Param("employeeId") Long employeeId
    );

    @Query("""
            select a
            from Appointment a
            join fetch a.doctor
            join fetch a.doctor.department
            join fetch a.hospital
            join fetch a.slot
            where a.employee.id = :employeeId
              and a.status in :statuses
              and (a.slot.slotDate > :today
                   or (a.slot.slotDate = :today and a.slot.startTime >= :currentTime))
            order by a.slot.slotDate asc, a.slot.startTime asc, a.id asc
            """)
    List<Appointment> findUpcomingForEmployee(
            @Param("employeeId") Long employeeId,
            @Param("statuses") List<AppointmentStatus> statuses,
            @Param("today") LocalDate today,
            @Param("currentTime") LocalTime currentTime
    );

    @Query("""
            select a
            from Appointment a
            join fetch a.doctor
            join fetch a.doctor.department
            join fetch a.hospital
            join fetch a.slot
            where a.employee.id = :employeeId
              and (a.status in :inactiveStatuses
                   or (a.status in :activeStatuses
                       and (a.slot.slotDate < :today
                            or (a.slot.slotDate = :today and a.slot.startTime < :currentTime))))
            order by a.slot.slotDate desc, a.slot.startTime desc, a.id desc
            """)
    List<Appointment> findPastForEmployee(
            @Param("employeeId") Long employeeId,
            @Param("activeStatuses") List<AppointmentStatus> activeStatuses,
            @Param("inactiveStatuses") List<AppointmentStatus> inactiveStatuses,
            @Param("today") LocalDate today,
            @Param("currentTime") LocalTime currentTime
    );

    @Query("""
            select count(a)
            from Appointment a
            where a.employee.id = :employeeId
              and a.slot.slotDate = :slotDate
              and a.status in :statuses
              and a.slot.startTime < :endTime
              and a.slot.endTime > :startTime
            """)
    long countActiveOverlappingAppointments(
            @Param("employeeId") Long employeeId,
            @Param("slotDate") LocalDate slotDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("statuses") List<AppointmentStatus> statuses
    );
}

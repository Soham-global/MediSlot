package com.hospital.appointment;

import com.hospital.slot.admin.dto.AdminSlotAppointmentRow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    boolean existsByDoctorId(Long doctorId);

    @Query("""
            select count(a)
            from Appointment a
            where a.hospital.id = :hospitalId
              and a.slot.slotDate = :slotDate
              and a.status in :statuses
            """)
    long countByHospitalIdAndSlotDateAndStatusIn(
            @Param("hospitalId") Long hospitalId,
            @Param("slotDate") LocalDate slotDate,
            @Param("statuses") List<AppointmentStatus> statuses
    );

    @Query("""
            select count(a)
            from Appointment a
            where a.hospital.id = :hospitalId
              and a.status = :status
              and a.slot.slotDate >= :fromDate
            """)
    long countByHospitalIdAndStatusFromDate(
            @Param("hospitalId") Long hospitalId,
            @Param("status") AppointmentStatus status,
            @Param("fromDate") LocalDate fromDate
    );

    @Query("""
            select count(a)
            from Appointment a
            where a.doctor.id = :doctorId
              and a.status in :statuses
              and a.slot.slotDate >= :fromDate
            """)
    long countByDoctorIdAndStatusInFromDate(
            @Param("doctorId") Long doctorId,
            @Param("statuses") List<AppointmentStatus> statuses,
            @Param("fromDate") LocalDate fromDate
    );

    @Query("""
            select count(a)
            from Appointment a
            where a.doctor.id = :doctorId
              and a.status in :statuses
              and a.slot.slotDate between :fromDate and :toDate
              and (:startTime is null or a.slot.startTime >= :startTime)
              and (:endTime is null or a.slot.startTime < :endTime)
            """)
    long countActiveAppointmentsForDoctorInRange(
            @Param("doctorId") Long doctorId,
            @Param("statuses") List<AppointmentStatus> statuses,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("""
            select new com.hospital.slot.admin.dto.AdminSlotAppointmentRow(
                a.slot.id,
                a.id,
                a.status,
                e.name,
                e.employeeCode
            )
            from Appointment a
            join a.employee e
            where a.slot.id in :slotIds
              and a.status <> :cancelledStatus
            """)
    List<AdminSlotAppointmentRow> findAppointmentSummariesBySlotIds(
            @Param("slotIds") List<Long> slotIds,
            @Param("cancelledStatus") AppointmentStatus cancelledStatus
    );

    @Query(
            value = """
                    select a
                    from Appointment a
                    join fetch a.employee
                    join fetch a.doctor d
                    join fetch d.department
                    join fetch a.slot s
                    where a.hospital.id = :hospitalId
                      and (:doctorId is null or d.id = :doctorId)
                      and (:date is null or s.slotDate = :date)
                      and (:status is null or a.status = :status)
                    order by s.slotDate desc, s.startTime desc, a.id desc
                    """,
            countQuery = """
                    select count(a)
                    from Appointment a
                    join a.doctor d
                    join a.slot s
                    where a.hospital.id = :hospitalId
                      and (:doctorId is null or d.id = :doctorId)
                      and (:date is null or s.slotDate = :date)
                      and (:status is null or a.status = :status)
                    """
    )
    Page<Appointment> findAdminAppointments(
            @Param("hospitalId") Long hospitalId,
            @Param("doctorId") Long doctorId,
            @Param("date") LocalDate date,
            @Param("status") AppointmentStatus status,
            Pageable pageable
    );

    @Query("""
            select a
            from Appointment a
            join fetch a.employee
            join fetch a.doctor d
            join fetch d.department
            join fetch a.slot
            where a.id = :id
              and a.hospital.id = :hospitalId
            """)
    Optional<Appointment> findDetailedByIdAndHospitalId(
            @Param("id") Long id,
            @Param("hospitalId") Long hospitalId
    );

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

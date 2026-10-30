package com.hospital.appointment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByEmployeeId(Long employeeId);

    List<Appointment> findByDoctorId(Long doctorId);

    List<Appointment> findByHospitalId(Long hospitalId);

    List<Appointment> findBySlotId(Long slotId);

    boolean existsBySlotIdAndStatusNot(Long slotId, AppointmentStatus status);
}

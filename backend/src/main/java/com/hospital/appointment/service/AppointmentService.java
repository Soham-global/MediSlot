package com.hospital.appointment.service;

import com.hospital.appointment.Appointment;
import com.hospital.appointment.AppointmentRepository;
import com.hospital.appointment.AppointmentStatus;
import com.hospital.appointment.CancelledBy;
import com.hospital.appointment.dto.AppointmentDepartmentResponse;
import com.hospital.appointment.dto.AppointmentDoctorResponse;
import com.hospital.appointment.dto.AppointmentHospitalResponse;
import com.hospital.appointment.dto.AppointmentResponse;
import com.hospital.appointment.dto.AppointmentSlotResponse;
import com.hospital.appointment.dto.CreateAppointmentRequest;
import com.hospital.auth.Employee;
import com.hospital.auth.EmployeeRepository;
import com.hospital.common.BadRequestException;
import com.hospital.common.ConflictException;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.doctor.Doctor;
import com.hospital.hospital.Hospital;
import com.hospital.slot.Slot;
import com.hospital.slot.SlotRepository;
import com.hospital.slot.SlotStatus;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;

@Service
public class AppointmentService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    private static final List<AppointmentStatus> ACTIVE_STATUSES =
            List.of(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED);
    private static final List<AppointmentStatus> INACTIVE_STATUSES =
            List.of(
                    AppointmentStatus.CANCELLED,
                    AppointmentStatus.COMPLETED,
                    AppointmentStatus.NO_SHOW
            );

    private final AppointmentRepository appointmentRepository;
    private final SlotRepository slotRepository;
    private final EmployeeRepository employeeRepository;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            SlotRepository slotRepository,
            EmployeeRepository employeeRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.slotRepository = slotRepository;
        this.employeeRepository = employeeRepository;
    }

    @Transactional
    public AppointmentResponse bookAppointment(Long employeeId, CreateAppointmentRequest request) {
        Slot slot = slotRepository.findByIdForUpdate(request.slotId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        LocalDateTime now = LocalDateTime.now(APP_ZONE);

        if (isSlotInPast(slot, now)) {
            throw new BadRequestException("Cannot book a slot in the past");
        }

        if (slot.getStatus() != SlotStatus.AVAILABLE) {
            throw new ConflictException("Slot is no longer available");
        }

        Doctor doctor = slot.getDoctor();
        if (!doctor.isActive()) {
            throw new BadRequestException("Doctor is not active");
        }

        Hospital hospital = doctor.getHospital();
        if (!hospital.isActive()) {
            throw new BadRequestException("Hospital is not active");
        }

        boolean hasOverlap = appointmentRepository.countActiveOverlappingAppointments(
                employeeId,
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                ACTIVE_STATUSES
        ) > 0;

        if (hasOverlap) {
            throw new ConflictException("You already have an overlapping appointment");
        }

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Appointment appointment = new Appointment();
        appointment.setEmployee(employee);
        appointment.setDoctor(doctor);
        appointment.setHospital(hospital);
        appointment.setSlot(slot);
        appointment.setReason(normalizeReason(request.reason()));
        appointment.setStatus(AppointmentStatus.BOOKED);

        slot.setStatus(SlotStatus.BOOKED);

        try {
            appointmentRepository.saveAndFlush(appointment);
        } catch (DataIntegrityViolationException exception) {
            throw new ConflictException("This slot has just been booked by someone else");
        }

        return appointmentRepository.findDetailedByIdAndEmployeeId(appointment.getId(), employeeId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointment(Long appointmentId, Long employeeId) {
        return appointmentRepository.findDetailedByIdAndEmployeeId(appointmentId, employeeId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments(Long employeeId, String status) {
        LocalDateTime now = LocalDateTime.now(APP_ZONE);
        String normalizedStatus = normalizeStatus(status);

        List<Appointment> appointments;

        if ("upcoming".equals(normalizedStatus)) {
            appointments = appointmentRepository.findUpcomingForEmployee(
                    employeeId,
                    ACTIVE_STATUSES,
                    now.toLocalDate(),
                    now.toLocalTime()
            );
        } else if ("past".equals(normalizedStatus)) {
            appointments = appointmentRepository.findPastForEmployee(
                    employeeId,
                    ACTIVE_STATUSES,
                    INACTIVE_STATUSES,
                    now.toLocalDate(),
                    now.toLocalTime()
            );
        } else {
            throw new BadRequestException("Status must be 'upcoming' or 'past'");
        }

        return appointments.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AppointmentResponse cancelAppointment(Long appointmentId, Long employeeId) {
        Long slotId = appointmentRepository.findSlotIdByIdAndEmployeeId(appointmentId, employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        Slot slot = slotRepository.findByIdForUpdate(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        Appointment appointment = appointmentRepository
                .findDetailedByIdAndEmployeeId(appointmentId, employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        cancelAppointmentInternal(appointment, slot, CancelledBy.EMPLOYEE);

        return toResponse(appointment);
    }

    @Transactional
    public Appointment cancelAppointmentForAdmin(Appointment appointment) {
        Slot slot = slotRepository.findByIdForUpdate(appointment.getSlot().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        cancelAppointmentInternal(appointment, slot, CancelledBy.ADMIN);

        return appointment;
    }

    private void cancelAppointmentInternal(
            Appointment appointment,
            Slot slot,
            CancelledBy cancelledBy
    ) {
        LocalDateTime now = LocalDateTime.now(APP_ZONE);

        if (appointment.getStatus() != AppointmentStatus.BOOKED
                && appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new ConflictException("Only booked or confirmed appointments can be cancelled");
        }

        if (!isSlotInFuture(slot, now)) {
            throw new BadRequestException("Only appointments with a future slot can be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledBy(cancelledBy);
        appointment.setUpdatedAt(now);
        slot.setStatus(SlotStatus.AVAILABLE);

        appointmentRepository.save(appointment);
        slotRepository.save(slot);
    }

    private String normalizeReason(String reason) {
        if (reason == null) {
            return "";
        }

        return reason.trim();
    }

    private String normalizeStatus(String status) {
        if (status == null || status.isBlank()) {
            return "upcoming";
        }

        return status.trim().toLowerCase(Locale.ROOT);
    }

    private boolean isSlotInPast(Slot slot, LocalDateTime now) {
        return slot.getSlotDate().isBefore(now.toLocalDate())
                || (slot.getSlotDate().equals(now.toLocalDate())
                && slot.getStartTime().isBefore(now.toLocalTime()));
    }

    private boolean isSlotInFuture(Slot slot, LocalDateTime now) {
        return slot.getSlotDate().isAfter(now.toLocalDate())
                || (slot.getSlotDate().equals(now.toLocalDate())
                && slot.getStartTime().isAfter(now.toLocalTime()));
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        Doctor doctor = appointment.getDoctor();
        Hospital hospital = appointment.getHospital();
        Slot slot = appointment.getSlot();

        return new AppointmentResponse(
                appointment.getId(),
                appointment.getStatus(),
                appointment.getReason(),
                appointment.getBookedAt(),
                appointment.getCancelledBy(),
                new AppointmentDoctorResponse(
                        doctor.getId(),
                        doctor.getName(),
                        doctor.getSpecialization(),
                        new AppointmentDepartmentResponse(
                                doctor.getDepartment().getId(),
                                doctor.getDepartment().getName()
                        )
                ),
                new AppointmentHospitalResponse(
                        hospital.getId(),
                        hospital.getName(),
                        hospital.getAddress(),
                        hospital.getCity(),
                        hospital.getPhone()
                ),
                new AppointmentSlotResponse(
                        slot.getId(),
                        slot.getSlotDate(),
                        slot.getStartTime(),
                        slot.getEndTime()
                )
        );
    }
}

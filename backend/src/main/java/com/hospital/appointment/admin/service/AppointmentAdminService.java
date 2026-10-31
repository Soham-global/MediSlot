package com.hospital.appointment.admin.service;

import com.hospital.appointment.Appointment;
import com.hospital.appointment.AppointmentRepository;
import com.hospital.appointment.AppointmentStatus;
import com.hospital.appointment.admin.dto.AdminAppointmentDepartmentResponse;
import com.hospital.appointment.admin.dto.AdminAppointmentDoctorResponse;
import com.hospital.appointment.admin.dto.AdminAppointmentEmployeeResponse;
import com.hospital.appointment.admin.dto.AdminAppointmentPageResponse;
import com.hospital.appointment.admin.dto.AdminAppointmentResponse;
import com.hospital.appointment.admin.dto.AdminAppointmentSlotResponse;
import com.hospital.appointment.service.AppointmentService;
import com.hospital.auth.Employee;
import com.hospital.auth.security.CurrentUser;
import com.hospital.common.BadRequestException;
import com.hospital.common.ConflictException;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.common.UnauthorizedException;
import com.hospital.doctor.Doctor;
import com.hospital.doctor.DoctorRepository;
import com.hospital.slot.Slot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Locale;

@Service
public class AppointmentAdminService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    private static final int MAX_PAGE_SIZE = 100;

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentService appointmentService;
    private final CurrentUser currentUser;

    public AppointmentAdminService(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            AppointmentService appointmentService,
            CurrentUser currentUser
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentService = appointmentService;
        this.currentUser = currentUser;
    }

    @Transactional(readOnly = true)
    public AdminAppointmentPageResponse getAppointments(
            Long doctorId,
            LocalDate date,
            String status,
            int page,
            int size
    ) {
        Long hospitalId = hospitalId();

        if (doctorId != null) {
            validateDoctor(doctorId, hospitalId);
        }

        AppointmentStatus parsedStatus = parseStatus(status);

        if (page < 0) {
            throw new BadRequestException("Page must be zero or greater");
        }
        if (size < 1) {
            throw new BadRequestException("Size must be at least 1");
        }

        int effectiveSize = Math.min(size, MAX_PAGE_SIZE);

        Page<Appointment> appointments = appointmentRepository.findAdminAppointments(
                hospitalId,
                doctorId,
                date,
                parsedStatus,
                PageRequest.of(page, effectiveSize)
        );

        return new AdminAppointmentPageResponse(
                appointments.getContent().stream()
                        .map(this::toResponse)
                        .toList(),
                appointments.getNumber(),
                appointments.getSize(),
                appointments.getTotalElements(),
                appointments.getTotalPages()
        );
    }

    @Transactional(readOnly = true)
    public AdminAppointmentResponse getAppointment(Long appointmentId) {
        return toResponse(findAppointment(appointmentId));
    }

    @Transactional
    public AdminAppointmentResponse confirmAppointment(Long appointmentId) {
        Appointment appointment = findAppointment(appointmentId);
        ensureTransition(appointment, AppointmentStatus.CONFIRMED);

        LocalDateTime now = LocalDateTime.now(APP_ZONE);
        if (isSlotStartPassed(appointment.getSlot(), now)) {
            throw new BadRequestException("Cannot confirm an appointment after the slot has started");
        }

        return updateStatus(appointment, AppointmentStatus.CONFIRMED, now);
    }

    @Transactional
    public AdminAppointmentResponse cancelAppointment(Long appointmentId) {
        Appointment appointment = findAppointment(appointmentId);
        ensureTransition(appointment, AppointmentStatus.CANCELLED);

        appointmentService.cancelAppointmentForAdmin(appointment);

        return toResponse(appointment);
    }

    @Transactional
    public AdminAppointmentResponse completeAppointment(Long appointmentId) {
        return changeStatusAfterSlotStart(appointmentId, AppointmentStatus.COMPLETED);
    }

    @Transactional
    public AdminAppointmentResponse markNoShow(Long appointmentId) {
        return changeStatusAfterSlotStart(appointmentId, AppointmentStatus.NO_SHOW);
    }

    private AdminAppointmentResponse changeStatusAfterSlotStart(
            Long appointmentId,
            AppointmentStatus targetStatus
    ) {
        Appointment appointment = findAppointment(appointmentId);
        ensureTransition(appointment, targetStatus);

        LocalDateTime now = LocalDateTime.now(APP_ZONE);
        if (isSlotStartInFuture(appointment.getSlot(), now)) {
            throw new BadRequestException(
                    "Cannot mark appointment as " + targetStatus
                            + " before the slot start time"
            );
        }

        return updateStatus(appointment, targetStatus, now);
    }

    private AdminAppointmentResponse updateStatus(
            Appointment appointment,
            AppointmentStatus status,
            LocalDateTime now
    ) {
        appointment.setStatus(status);
        appointment.setUpdatedAt(now);
        appointmentRepository.save(appointment);

        return toResponse(appointment);
    }

    private void ensureTransition(Appointment appointment, AppointmentStatus targetStatus) {
        AppointmentStatus currentStatus = appointment.getStatus();

        boolean allowed = switch (currentStatus) {
            case BOOKED -> targetStatus == AppointmentStatus.CONFIRMED
                    || targetStatus == AppointmentStatus.CANCELLED;
            case CONFIRMED -> targetStatus == AppointmentStatus.COMPLETED
                    || targetStatus == AppointmentStatus.NO_SHOW
                    || targetStatus == AppointmentStatus.CANCELLED;
            case CANCELLED, COMPLETED, NO_SHOW -> false;
        };

        if (!allowed) {
            throw new ConflictException(
                    "Cannot change status from " + currentStatus + " to " + targetStatus
            );
        }
    }

    private AppointmentStatus parseStatus(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }

        try {
            return AppointmentStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException(
                    "Invalid status. Allowed values: BOOKED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW"
            );
        }
    }

    private void validateDoctor(Long doctorId, Long hospitalId) {
        if (!doctorRepository.existsById(doctorId)) {
            throw new BadRequestException("Doctor not found");
        }
        if (!doctorRepository.existsByIdAndHospitalId(doctorId, hospitalId)) {
            throw new ResourceNotFoundException("Doctor not found");
        }
    }

    private Appointment findAppointment(Long appointmentId) {
        return appointmentRepository.findDetailedByIdAndHospitalId(appointmentId, hospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    private boolean isSlotStartPassed(Slot slot, LocalDateTime now) {
        return slot.getSlotDate().isBefore(now.toLocalDate())
                || (slot.getSlotDate().equals(now.toLocalDate())
                && slot.getStartTime().isBefore(now.toLocalTime()));
    }

    private boolean isSlotStartInFuture(Slot slot, LocalDateTime now) {
        return slot.getSlotDate().isAfter(now.toLocalDate())
                || (slot.getSlotDate().equals(now.toLocalDate())
                && slot.getStartTime().isAfter(now.toLocalTime()));
    }

    private Long hospitalId() {
        Long hospitalId = currentUser.hospitalId();
        if (hospitalId == null) {
            throw new UnauthorizedException("Invalid admin token");
        }
        return hospitalId;
    }

    private AdminAppointmentResponse toResponse(Appointment appointment) {
        Employee employee = appointment.getEmployee();
        Doctor doctor = appointment.getDoctor();
        Slot slot = appointment.getSlot();

        return new AdminAppointmentResponse(
                appointment.getId(),
                appointment.getStatus(),
                appointment.getReason(),
                appointment.getBookedAt(),
                appointment.getUpdatedAt(),
                appointment.getCancelledBy(),
                new AdminAppointmentEmployeeResponse(
                        employee.getId(),
                        employee.getEmployeeCode(),
                        employee.getName(),
                        employee.getEmail(),
                        employee.getPhone(),
                        employee.getPlantLocation()
                ),
                new AdminAppointmentDoctorResponse(
                        doctor.getId(),
                        doctor.getName(),
                        doctor.getSpecialization(),
                        new AdminAppointmentDepartmentResponse(
                                doctor.getDepartment().getId(),
                                doctor.getDepartment().getName()
                        )
                ),
                new AdminAppointmentSlotResponse(
                        slot.getId(),
                        slot.getSlotDate(),
                        slot.getStartTime(),
                        slot.getEndTime()
                )
        );
    }
}

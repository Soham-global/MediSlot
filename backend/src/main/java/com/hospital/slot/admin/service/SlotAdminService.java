package com.hospital.slot.admin.service;

import com.hospital.appointment.AppointmentRepository;
import com.hospital.appointment.AppointmentStatus;
import com.hospital.auth.security.CurrentUser;
import com.hospital.common.BadRequestException;
import com.hospital.common.ConflictException;
import com.hospital.common.ResourceNotFoundException;
import com.hospital.common.UnauthorizedException;
import com.hospital.doctor.Doctor;
import com.hospital.doctor.DoctorRepository;
import com.hospital.doctor.DoctorSchedule;
import com.hospital.doctor.DoctorScheduleRepository;
import com.hospital.slot.Slot;
import com.hospital.slot.SlotRepository;
import com.hospital.slot.SlotStatus;
import com.hospital.slot.admin.dto.AdminDoctorScheduleEntryResponse;
import com.hospital.slot.admin.dto.AdminSlotAppointmentResponse;
import com.hospital.slot.admin.dto.AdminSlotAppointmentRow;
import com.hospital.slot.admin.dto.AdminSlotResponse;
import com.hospital.slot.admin.dto.BlockSlotsRequest;
import com.hospital.slot.admin.dto.BlockSlotsResponse;
import com.hospital.slot.admin.dto.DoctorScheduleUpdateResponse;
import com.hospital.slot.admin.dto.ReplaceDoctorScheduleRequest;
import com.hospital.slot.admin.dto.ScheduleEntryRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SlotAdminService {

    private static final ZoneId APP_ZONE = ZoneId.of("Asia/Kolkata");
    private static final List<AppointmentStatus> ACTIVE_APPOINTMENT_STATUSES =
            List.of(AppointmentStatus.BOOKED, AppointmentStatus.CONFIRMED);
    private static final int MAX_BLOCK_RANGE_DAYS = 60;

    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final SlotRepository slotRepository;
    private final AppointmentRepository appointmentRepository;
    private final SlotGenerationService slotGenerationService;
    private final CurrentUser currentUser;

    public SlotAdminService(
            DoctorRepository doctorRepository,
            DoctorScheduleRepository doctorScheduleRepository,
            SlotRepository slotRepository,
            AppointmentRepository appointmentRepository,
            SlotGenerationService slotGenerationService,
            CurrentUser currentUser
    ) {
        this.doctorRepository = doctorRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.slotRepository = slotRepository;
        this.appointmentRepository = appointmentRepository;
        this.slotGenerationService = slotGenerationService;
        this.currentUser = currentUser;
    }

    @Transactional
    public DoctorScheduleUpdateResponse replaceSchedule(
            Long doctorId,
            ReplaceDoctorScheduleRequest request
    ) {
        Doctor doctor = findDoctor(doctorId);
        List<DoctorSchedule> newSchedules = buildSchedules(doctor, request.schedules());

        doctorScheduleRepository.deleteAllByDoctorId(doctorId);
        doctorScheduleRepository.saveAll(newSchedules);

        LocalDateTime now = LocalDateTime.now(APP_ZONE);
        LocalDate today = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();

        List<Slot> futureAvailableSlots =
                slotRepository
                        .findByDoctorIdAndSlotDateGreaterThanEqualAndStatusOrderBySlotDateAscStartTimeAsc(
                                doctorId,
                                today,
                                SlotStatus.AVAILABLE
                        );

        List<Slot> slotsToRemove = futureAvailableSlots.stream()
                .filter(slot -> !isPast(slot, today, currentTime))
                .filter(slot -> !isCoveredBySchedule(slot, newSchedules))
                .toList();

        if (!slotsToRemove.isEmpty()) {
            slotRepository.deleteAll(slotsToRemove);
            slotRepository.flush();
        }

        int slotsCreated = slotGenerationService.generateSlots(doctor);

        List<Slot> futureBookedSlots =
                slotRepository
                        .findByDoctorIdAndSlotDateGreaterThanEqualAndStatusOrderBySlotDateAscStartTimeAsc(
                                doctorId,
                                today,
                                SlotStatus.BOOKED
                        );

        long bookedSlotsKept = futureBookedSlots.stream()
                .filter(slot -> !isPast(slot, today, currentTime))
                .count();

        return new DoctorScheduleUpdateResponse(
                doctorId,
                toScheduleResponses(newSchedules),
                slotsCreated,
                slotsToRemove.size(),
                bookedSlotsKept
        );
    }

    @Transactional(readOnly = true)
    public List<AdminSlotResponse> getSlots(Long doctorId, LocalDate date) {
        if (date == null) {
            throw new BadRequestException("Date is required");
        }

        Doctor doctor = findDoctor(doctorId);

        List<Slot> slots =
                slotRepository.findByDoctorIdAndSlotDateOrderByStartTimeAsc(doctor.getId(), date);

        List<Long> bookedSlotIds = slots.stream()
                .filter(slot -> slot.getStatus() == SlotStatus.BOOKED)
                .map(Slot::getId)
                .toList();

        Map<Long, AdminSlotAppointmentRow> appointmentSummaries = bookedSlotIds.isEmpty()
                ? Map.of()
                : appointmentRepository
                        .findAppointmentSummariesBySlotIds(
                                bookedSlotIds,
                                AppointmentStatus.CANCELLED
                        )
                        .stream()
                        .collect(Collectors.toMap(
                                AdminSlotAppointmentRow::slotId,
                                row -> row,
                                (first, second) -> first
                        ));

        return slots.stream()
                .map(slot -> toSlotResponse(
                        slot,
                        slot.getStatus() == SlotStatus.BOOKED
                                ? appointmentSummaries.get(slot.getId())
                                : null
                ))
                .toList();
    }

    @Transactional
    public BlockSlotsResponse blockSlots(Long doctorId, BlockSlotsRequest request) {
        Doctor doctor = findDoctor(doctorId);
        LocalDate today = LocalDate.now(APP_ZONE);

        if (request.fromDate().isBefore(today)) {
            throw new BadRequestException("From date cannot be in the past");
        }
        if (request.fromDate().isAfter(request.toDate())) {
            throw new BadRequestException("From date must not be after to date");
        }

        long rangeDays = ChronoUnit.DAYS.between(request.fromDate(), request.toDate()) + 1;
        if (rangeDays > MAX_BLOCK_RANGE_DAYS) {
            throw new BadRequestException("Date range cannot be longer than 60 days");
        }

        boolean hasStartTime = request.startTime() != null;
        boolean hasEndTime = request.endTime() != null;

        if (hasStartTime != hasEndTime) {
            throw new BadRequestException("Start time and end time must be given together");
        }
        if (hasStartTime && !request.endTime().isAfter(request.startTime())) {
            throw new BadRequestException("End time must be after start time");
        }

        long conflictingBookings = appointmentRepository.countActiveAppointmentsForDoctorInRange(
                doctor.getId(),
                ACTIVE_APPOINTMENT_STATUSES,
                request.fromDate(),
                request.toDate(),
                request.startTime(),
                request.endTime()
        );

        if (conflictingBookings > 0) {
            throw new ConflictException(conflictMessage(conflictingBookings));
        }

        List<Slot> availableSlots =
                slotRepository
                        .findByDoctorIdAndSlotDateBetweenAndStatusOrderBySlotDateAscStartTimeAsc(
                                doctor.getId(),
                                request.fromDate(),
                                request.toDate(),
                                SlotStatus.AVAILABLE
                        );

        List<Slot> slotsToBlock = availableSlots.stream()
                .filter(slot -> !hasStartTime || isWithinTimeWindow(
                        slot,
                        request.startTime(),
                        request.endTime()
                ))
                .toList();

        String reason = request.reason().trim();
        for (Slot slot : slotsToBlock) {
            slot.setStatus(SlotStatus.BLOCKED);
            slot.setBlockReason(reason);
        }

        if (!slotsToBlock.isEmpty()) {
            slotRepository.saveAll(slotsToBlock);
        }

        return new BlockSlotsResponse(slotsToBlock.size());
    }

    @Transactional
    public AdminSlotResponse unblockSlot(Long slotId) {
        Slot slot = slotRepository.findByIdAndHospitalIdWithDoctor(slotId, hospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Slot not found"));

        if (slot.getStatus() != SlotStatus.BLOCKED) {
            throw new ConflictException("Slot is not blocked");
        }

        LocalDateTime now = LocalDateTime.now(APP_ZONE);
        if (isPast(slot, now.toLocalDate(), now.toLocalTime())) {
            throw new BadRequestException("Cannot unblock a slot in the past");
        }

        slot.setStatus(SlotStatus.AVAILABLE);
        slot.setBlockReason(null);
        slotRepository.save(slot);

        return toSlotResponse(slot, null);
    }

    private List<DoctorSchedule> buildSchedules(
            Doctor doctor,
            List<ScheduleEntryRequest> entries
    ) {
        if (entries == null) {
            throw new BadRequestException("Schedules are required");
        }

        List<DoctorSchedule> schedules = new ArrayList<>();

        for (ScheduleEntryRequest entry : entries) {
            if (entry == null
                    || entry.dayOfWeek() == null
                    || entry.startTime() == null
                    || entry.endTime() == null
                    || entry.slotDurationMinutes() == null) {
                throw new BadRequestException("All schedule fields are required");
            }

            if (entry.dayOfWeek() < 1 || entry.dayOfWeek() > 7) {
                throw new BadRequestException("Day of week must be between 1 and 7");
            }
            if (entry.slotDurationMinutes() < 5 || entry.slotDurationMinutes() > 120) {
                throw new BadRequestException("Slot duration must be between 5 and 120 minutes");
            }
            if (!entry.endTime().isAfter(entry.startTime())) {
                throw new BadRequestException("End time must be after start time");
            }
            if (Duration.between(entry.startTime(), entry.endTime()).toMinutes()
                    < entry.slotDurationMinutes()) {
                throw new BadRequestException("Time range must fit at least one slot");
            }

            DoctorSchedule schedule = new DoctorSchedule();
            schedule.setDoctor(doctor);
            schedule.setDayOfWeek(entry.dayOfWeek());
            schedule.setStartTime(entry.startTime());
            schedule.setEndTime(entry.endTime());
            schedule.setSlotDurationMinutes(entry.slotDurationMinutes());
            schedule.setActive(true);
            schedules.add(schedule);
        }

        schedules.sort(Comparator
                .comparingInt(DoctorSchedule::getDayOfWeek)
                .thenComparing(DoctorSchedule::getStartTime));

        for (int index = 1; index < schedules.size(); index++) {
            DoctorSchedule previous = schedules.get(index - 1);
            DoctorSchedule current = schedules.get(index);

            if (previous.getDayOfWeek() == current.getDayOfWeek()
                    && previous.getEndTime().isAfter(current.getStartTime())) {
                throw new BadRequestException("Schedules on the same day must not overlap");
            }
        }

        return schedules;
    }

    private boolean isCoveredBySchedule(Slot slot, List<DoctorSchedule> schedules) {
        int dayOfWeek = slot.getSlotDate().getDayOfWeek().getValue();

        for (DoctorSchedule schedule : schedules) {
            if (schedule.getDayOfWeek() != dayOfWeek) {
                continue;
            }
            if (slot.getStartTime().isBefore(schedule.getStartTime())) {
                continue;
            }
            if (slot.getEndTime().isAfter(schedule.getEndTime())) {
                continue;
            }
            if (!slot.getEndTime().equals(
                    slot.getStartTime().plusMinutes(schedule.getSlotDurationMinutes())
            )) {
                continue;
            }

            long offsetMinutes = Duration.between(
                    schedule.getStartTime(),
                    slot.getStartTime()
            ).toMinutes();

            if (offsetMinutes >= 0
                    && offsetMinutes % schedule.getSlotDurationMinutes() == 0) {
                return true;
            }
        }

        return false;
    }

    private boolean isWithinTimeWindow(Slot slot, LocalTime startTime, LocalTime endTime) {
        return !slot.getStartTime().isBefore(startTime)
                && slot.getStartTime().isBefore(endTime);
    }

    private boolean isPast(Slot slot, LocalDate today, LocalTime currentTime) {
        return slot.getSlotDate().isBefore(today)
                || (slot.getSlotDate().equals(today)
                && slot.getStartTime().isBefore(currentTime));
    }

    private String conflictMessage(long conflictingBookings) {
        return conflictingBookings + " active "
                + (conflictingBookings == 1 ? "booking conflicts" : "bookings conflict")
                + " with this block. Cancel those appointments first.";
    }

    private Doctor findDoctor(Long doctorId) {
        return doctorRepository.findByIdAndHospitalIdWithDetails(doctorId, hospitalId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

    private Long hospitalId() {
        Long hospitalId = currentUser.hospitalId();
        if (hospitalId == null) {
            throw new UnauthorizedException("Invalid admin token");
        }
        return hospitalId;
    }

    private List<AdminDoctorScheduleEntryResponse> toScheduleResponses(
            List<DoctorSchedule> schedules
    ) {
        return schedules.stream()
                .map(schedule -> new AdminDoctorScheduleEntryResponse(
                        schedule.getDayOfWeek(),
                        DayOfWeek.of(schedule.getDayOfWeek())
                                .getDisplayName(TextStyle.FULL, Locale.ENGLISH),
                        schedule.getStartTime(),
                        schedule.getEndTime(),
                        schedule.getSlotDurationMinutes()
                ))
                .toList();
    }

    private AdminSlotResponse toSlotResponse(Slot slot, AdminSlotAppointmentRow row) {
        return new AdminSlotResponse(
                slot.getId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getStatus(),
                slot.getBlockReason(),
                row == null
                        ? null
                        : new AdminSlotAppointmentResponse(
                                row.appointmentId(),
                                row.status(),
                                row.employeeName(),
                                row.employeeCode()
                        )
        );
    }
}

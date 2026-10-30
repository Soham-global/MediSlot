package com.hospital.config;

import com.hospital.appointment.Appointment;
import com.hospital.appointment.AppointmentRepository;
import com.hospital.appointment.AppointmentStatus;
import com.hospital.appointment.CancelledBy;
import com.hospital.auth.Admin;
import com.hospital.auth.AdminRepository;
import com.hospital.auth.AdminRole;
import com.hospital.auth.Employee;
import com.hospital.auth.EmployeeRepository;
import com.hospital.doctor.Doctor;
import com.hospital.doctor.DoctorRepository;
import com.hospital.doctor.DoctorSchedule;
import com.hospital.doctor.DoctorScheduleRepository;
import com.hospital.hospital.Department;
import com.hospital.hospital.DepartmentRepository;
import com.hospital.hospital.Hospital;
import com.hospital.hospital.HospitalRepository;
import com.hospital.slot.Slot;
import com.hospital.slot.SlotRepository;
import com.hospital.slot.SlotStatus;
import com.hospital.symptom.SymptomKeyword;
import com.hospital.symptom.SymptomKeywordRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@Order(2)
public class DataSeeder implements ApplicationRunner {

    private static final String DEFAULT_PASSWORD = "password123";
    private static final ZoneId KOLKATA = ZoneId.of("Asia/Kolkata");

    private final HospitalRepository hospitalRepository;
    private final DepartmentRepository departmentRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorScheduleRepository doctorScheduleRepository;
    private final SlotRepository slotRepository;
    private final EmployeeRepository employeeRepository;
    private final AdminRepository adminRepository;
    private final AppointmentRepository appointmentRepository;
    private final SymptomKeywordRepository symptomKeywordRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            HospitalRepository hospitalRepository,
            DepartmentRepository departmentRepository,
            DoctorRepository doctorRepository,
            DoctorScheduleRepository doctorScheduleRepository,
            SlotRepository slotRepository,
            EmployeeRepository employeeRepository,
            AdminRepository adminRepository,
            AppointmentRepository appointmentRepository,
            SymptomKeywordRepository symptomKeywordRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.hospitalRepository = hospitalRepository;
        this.departmentRepository = departmentRepository;
        this.doctorRepository = doctorRepository;
        this.doctorScheduleRepository = doctorScheduleRepository;
        this.slotRepository = slotRepository;
        this.employeeRepository = employeeRepository;
        this.adminRepository = adminRepository;
        this.appointmentRepository = appointmentRepository;
        this.symptomKeywordRepository = symptomKeywordRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!allTablesEmpty()) {
            return;
        }

        String passwordHash = passwordEncoder.encode(DEFAULT_PASSWORD);

        List<Hospital> hospitals = createHospitals();
        Map<String, Department> departments = createDepartments();
        createAdmins(hospitals, passwordHash);
        List<Employee> employees = createEmployees(passwordHash);
        List<Doctor> doctors = createDoctors(hospitals, departments);
        List<DoctorSchedule> schedules = createSchedules(doctors);
        List<Slot> slots = createSlots(doctors, schedules);

        createAppointments(employees, doctors, hospitals, slots);
        createSymptomKeywords(departments);
    }

    private boolean allTablesEmpty() {
        return hospitalRepository.count() == 0
                && departmentRepository.count() == 0
                && doctorRepository.count() == 0
                && doctorScheduleRepository.count() == 0
                && slotRepository.count() == 0
                && employeeRepository.count() == 0
                && adminRepository.count() == 0
                && appointmentRepository.count() == 0
                && symptomKeywordRepository.count() == 0;
    }

    private List<Hospital> createHospitals() {
        Hospital pune = new Hospital();
        pune.setName("Motherson Health Center");
        pune.setAddress("Plot 12, Hinjewadi Industrial Area");
        pune.setCity("Pune");
        pune.setPhone("020-45678901");
        pune.setEmail("care.pune@medislot.com");
        pune.setOpeningTime(LocalTime.of(8, 0));
        pune.setClosingTime(LocalTime.of(20, 0));
        pune.setActive(true);

        Hospital noida = new Hospital();
        noida.setName("Motherson Care Hospital");
        noida.setAddress("Sector 63, Noida Expressway");
        noida.setCity("Noida");
        noida.setPhone("0120-4567890");
        noida.setEmail("care.noida@medislot.com");
        noida.setOpeningTime(LocalTime.of(9, 0));
        noida.setClosingTime(LocalTime.of(18, 0));
        noida.setActive(true);

        Hospital chennai = new Hospital();
        chennai.setName("Motherson Medical Center");
        chennai.setAddress("Guindy Industrial Estate");
        chennai.setCity("Chennai");
        chennai.setPhone("044-45678901");
        chennai.setEmail("care.chennai@medislot.com");
        chennai.setOpeningTime(LocalTime.of(8, 30));
        chennai.setClosingTime(LocalTime.of(17, 30));
        chennai.setActive(true);

        return hospitalRepository.saveAll(List.of(pune, noida, chennai));
    }

    private Map<String, Department> createDepartments() {
        Map<String, Department> departments = new LinkedHashMap<>();
        departments.put("Cardiology", createDepartment("Cardiology", "Heart and cardiovascular care"));
        departments.put("Orthopedics", createDepartment("Orthopedics", "Bones, joints, muscles and spine care"));
        departments.put("Dental", createDepartment("Dental", "Oral health and dental procedures"));
        departments.put("Dermatology", createDepartment("Dermatology", "Skin, hair and nail care"));
        departments.put("General Medicine", createDepartment("General Medicine", "General health consultations and preventive care"));
        departments.put("ENT", createDepartment("ENT", "Ear, nose and throat care"));
        departments.put("Pediatrics", createDepartment("Pediatrics", "Healthcare for infants, children and adolescents"));
        departments.put("Neurology", createDepartment("Neurology", "Brain, spine and nervous system care"));
        return departments;
    }

    private Department createDepartment(String name, String description) {
        Department department = new Department();
        department.setName(name);
        department.setDescription(description);
        return departmentRepository.save(department);
    }

    private void createAdmins(List<Hospital> hospitals, String passwordHash) {
        Admin puneAdmin = new Admin();
        puneAdmin.setHospital(hospitals.get(0));
        puneAdmin.setName("Anita Sharma");
        puneAdmin.setEmail("admin.pune@medislot.com");
        puneAdmin.setPasswordHash(passwordHash);
        puneAdmin.setRole(AdminRole.HOSPITAL_ADMIN);
        puneAdmin.setActive(true);

        Admin noidaAdmin = new Admin();
        noidaAdmin.setHospital(hospitals.get(1));
        noidaAdmin.setName("Vikram Rao");
        noidaAdmin.setEmail("admin.noida@medislot.com");
        noidaAdmin.setPasswordHash(passwordHash);
        noidaAdmin.setRole(AdminRole.HOSPITAL_ADMIN);
        noidaAdmin.setActive(true);

        Admin chennaiAdmin = new Admin();
        chennaiAdmin.setHospital(hospitals.get(2));
        chennaiAdmin.setName("Priya Nair");
        chennaiAdmin.setEmail("admin.chennai@medislot.com");
        chennaiAdmin.setPasswordHash(passwordHash);
        chennaiAdmin.setRole(AdminRole.HOSPITAL_ADMIN);
        chennaiAdmin.setActive(true);

        adminRepository.saveAll(List.of(puneAdmin, noidaAdmin, chennaiAdmin));
    }

    private List<Employee> createEmployees(String passwordHash) {
        Employee aarav = createEmployee("EMP001", "Aarav Sharma", "aarav.sharma@motherson.com", "9876500001", "Pune Plant", passwordHash);
        Employee diya = createEmployee("EMP002", "Diya Patel", "diya.patel@motherson.com", "9876500002", "Noida Plant", passwordHash);
        Employee aditya = createEmployee("EMP003", "Aditya Singh", "aditya.singh@motherson.com", "9876500003", "Chennai Plant", passwordHash);
        Employee ishita = createEmployee("EMP004", "Ishita Nair", "ishita.nair@motherson.com", "9876500004", "Pune Plant", passwordHash);
        Employee kabir = createEmployee("EMP005", "Kabir Joshi", "kabir.joshi@motherson.com", "9876500005", "Noida Plant", passwordHash);
        Employee ananya = createEmployee("EMP006", "Ananya Rao", "ananya.rao@motherson.com", "9876500006", "Chennai Plant", passwordHash);
        Employee vivaan = createEmployee("EMP007", "Vivaan Gupta", "vivaan.gupta@motherson.com", "9876500007", "Manesar Plant", passwordHash);
        Employee saanvi = createEmployee("EMP008", "Saanvi Iyer", "saanvi.iyer@motherson.com", "9876500008", "Bengaluru Plant", passwordHash);

        return employeeRepository.saveAll(List.of(aarav, diya, aditya, ishita, kabir, ananya, vivaan, saanvi));
    }

    private Employee createEmployee(
            String employeeCode,
            String name,
            String email,
            String phone,
            String plantLocation,
            String passwordHash
    ) {
        Employee employee = new Employee();
        employee.setEmployeeCode(employeeCode);
        employee.setName(name);
        employee.setEmail(email);
        employee.setPhone(phone);
        employee.setPlantLocation(plantLocation);
        employee.setPasswordHash(passwordHash);
        return employee;
    }

    private List<Doctor> createDoctors(List<Hospital> hospitals, Map<String, Department> departments) {
        List<Doctor> doctors = new ArrayList<>();
        doctors.add(createDoctor(hospitals.get(0), departments.get("Cardiology"), "Dr. Arjun Mehta", "Cardiology", "MBBS, MD (Cardiology)", 15));
        doctors.add(createDoctor(hospitals.get(0), departments.get("Orthopedics"), "Dr. Kavita Iyer", "Orthopedics", "MBBS, MS (Orthopedics)", 12));
        doctors.add(createDoctor(hospitals.get(0), departments.get("General Medicine"), "Dr. Rohan Deshmukh", "General Medicine", "MBBS, MD (General Medicine)", 8));
        doctors.add(createDoctor(hospitals.get(0), departments.get("Dermatology"), "Dr. Sneha Kapoor", "Dermatology", "MBBS, MD (Dermatology)", 6));
        doctors.add(createDoctor(hospitals.get(1), departments.get("Cardiology"), "Dr. Vikram Malhotra", "Cardiology", "MBBS, DM (Cardiology)", 18));
        doctors.add(createDoctor(hospitals.get(1), departments.get("Pediatrics"), "Dr. Neha Gupta", "Pediatrics", "MBBS, MD (Pediatrics)", 10));
        doctors.add(createDoctor(hospitals.get(1), departments.get("ENT"), "Dr. Sanjay Verma", "ENT", "MBBS, MS (ENT)", 14));
        doctors.add(createDoctor(hospitals.get(1), departments.get("Neurology"), "Dr. Pooja Reddy", "Neurology", "MBBS, DM (Neurology)", 9));
        doctors.add(createDoctor(hospitals.get(2), departments.get("Orthopedics"), "Dr. Karthik Subramanian", "Orthopedics", "MBBS, MS (Orthopedics)", 16));
        doctors.add(createDoctor(hospitals.get(2), departments.get("Dental"), "Dr. Divya Krishnan", "Dental", "BDS, MDS", 7));
        doctors.add(createDoctor(hospitals.get(2), departments.get("General Medicine"), "Dr. Anand Rao", "General Medicine", "MBBS, MD (General Medicine)", 11));
        doctors.add(createDoctor(hospitals.get(2), departments.get("Dermatology"), "Dr. Meera Pillai", "Dermatology", "MBBS, MD (Dermatology)", 5));
        return doctorRepository.saveAll(doctors);
    }

    private Doctor createDoctor(
            Hospital hospital,
            Department department,
            String name,
            String specialization,
            String qualification,
            int experienceYears
    ) {
        Doctor doctor = new Doctor();
        doctor.setHospital(hospital);
        doctor.setDepartment(department);
        doctor.setName(name);
        doctor.setSpecialization(specialization);
        doctor.setQualification(qualification);
        doctor.setExperienceYears(experienceYears);
        doctor.setActive(true);
        return doctor;
    }

    private List<DoctorSchedule> createSchedules(List<Doctor> doctors) {
        List<DoctorSchedule> schedules = new ArrayList<>();

        for (int index = 0; index < doctors.size(); index++) {
            Doctor doctor = doctors.get(index);
            int pattern = index % 3;
            List<Integer> days;
            LocalTime startTime;
            LocalTime endTime;
            int duration;

            if (pattern == 0) {
                days = List.of(1, 2, 3, 4, 5);
                startTime = LocalTime.of(9, 0);
                endTime = LocalTime.of(13, 0);
                duration = 30;
            } else if (pattern == 1) {
                days = List.of(1, 2, 3, 4, 5, 6);
                startTime = LocalTime.of(14, 0);
                endTime = LocalTime.of(18, 0);
                duration = 30;
            } else {
                days = List.of(1, 3, 5);
                startTime = index % 2 == 0 ? LocalTime.of(9, 0) : LocalTime.of(14, 0);
                endTime = index % 2 == 0 ? LocalTime.of(12, 0) : LocalTime.of(17, 0);
                duration = 45;
            }

            for (Integer day : days) {
                DoctorSchedule schedule = new DoctorSchedule();
                schedule.setDoctor(doctor);
                schedule.setDayOfWeek(day);
                schedule.setStartTime(startTime);
                schedule.setEndTime(endTime);
                schedule.setSlotDurationMinutes(duration);
                schedule.setActive(true);
                schedules.add(schedule);
            }
        }

        return doctorScheduleRepository.saveAll(schedules);
    }

    private List<Slot> createSlots(List<Doctor> doctors, List<DoctorSchedule> schedules) {
        List<Slot> slots = new ArrayList<>();
        LocalDate firstDate = LocalDate.now(KOLKATA);

        for (Doctor doctor : doctors) {
            List<DoctorSchedule> doctorSchedules = schedules.stream()
                    .filter(schedule -> schedule.getDoctor().getId().equals(doctor.getId()))
                    .toList();

            for (int dayOffset = 0; dayOffset < 14; dayOffset++) {
                LocalDate slotDate = firstDate.plusDays(dayOffset);
                int dayOfWeek = slotDate.getDayOfWeek().getValue();

                for (DoctorSchedule schedule : doctorSchedules) {
                    if (schedule.getDayOfWeek() != dayOfWeek || !schedule.isActive()) {
                        continue;
                    }

                    LocalTime cursor = schedule.getStartTime();
                    while (!cursor.plusMinutes(schedule.getSlotDurationMinutes()).isAfter(schedule.getEndTime())) {
                        Slot slot = new Slot();
                        slot.setDoctor(doctor);
                        slot.setSlotDate(slotDate);
                        slot.setStartTime(cursor);
                        slot.setEndTime(cursor.plusMinutes(schedule.getSlotDurationMinutes()));
                        slot.setStatus(SlotStatus.AVAILABLE);
                        slots.add(slot);
                        cursor = cursor.plusMinutes(schedule.getSlotDurationMinutes());
                    }
                }
            }
        }

        return slotRepository.saveAll(slots);
    }

    private void createAppointments(
            List<Employee> employees,
            List<Doctor> doctors,
            List<Hospital> hospitals,
            List<Slot> slots
    ) {
        Slot bookedSlot = findFirstAvailableSlot(slots, doctors.get(0));
        Slot confirmedSlot = findFirstAvailableSlot(slots, doctors.get(4));
        Slot cancelledSlot = findFirstAvailableSlot(slots, doctors.get(8));
        Slot completedSlot = findFirstAvailableSlot(slots, doctors.get(5));
        Slot noShowSlot = findFirstAvailableSlot(slots, doctors.get(11));

        bookedSlot.setStatus(SlotStatus.BOOKED);
        confirmedSlot.setStatus(SlotStatus.BOOKED);
        completedSlot.setStatus(SlotStatus.BOOKED);
        noShowSlot.setStatus(SlotStatus.BOOKED);

        LocalDateTime now = LocalDateTime.now(KOLKATA);

        Appointment booked = createAppointment(
                employees.get(0),
                doctors.get(0),
                hospitals.get(0),
                bookedSlot,
                "Recurring chest discomfort",
                AppointmentStatus.BOOKED,
                null,
                now.minusHours(3),
                now
        );

        Appointment confirmed = createAppointment(
                employees.get(1),
                doctors.get(4),
                hospitals.get(1),
                confirmedSlot,
                "Annual cardiac check-up",
                AppointmentStatus.CONFIRMED,
                null,
                now.minusDays(1),
                now.minusHours(2)
        );

        Appointment cancelled = createAppointment(
                employees.get(2),
                doctors.get(8),
                hospitals.get(2),
                cancelledSlot,
                "Knee pain consultation",
                AppointmentStatus.CANCELLED,
                CancelledBy.EMPLOYEE,
                now.minusDays(2),
                now.minusDays(1)
        );

        Appointment completed = createAppointment(
                employees.get(3),
                doctors.get(5),
                hospitals.get(1),
                completedSlot,
                "Child vaccination follow-up",
                AppointmentStatus.COMPLETED,
                null,
                now.minusDays(10),
                now.minusDays(9)
        );

        Appointment noShow = createAppointment(
                employees.get(4),
                doctors.get(11),
                hospitals.get(2),
                noShowSlot,
                "Skin allergy review",
                AppointmentStatus.NO_SHOW,
                null,
                now.minusDays(6),
                now.minusDays(5)
        );

        slotRepository.saveAll(List.of(bookedSlot, confirmedSlot, cancelledSlot, completedSlot, noShowSlot));
        appointmentRepository.saveAll(List.of(booked, confirmed, cancelled, completed, noShow));
    }

    private Slot findFirstAvailableSlot(List<Slot> slots, Doctor doctor) {
        return slots.stream()
                .filter(slot -> slot.getDoctor().getId().equals(doctor.getId()))
                .filter(slot -> slot.getStatus() == SlotStatus.AVAILABLE)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No available slot found for doctor " + doctor.getName()));
    }

    private Appointment createAppointment(
            Employee employee,
            Doctor doctor,
            Hospital hospital,
            Slot slot,
            String reason,
            AppointmentStatus status,
            CancelledBy cancelledBy,
            LocalDateTime bookedAt,
            LocalDateTime updatedAt
    ) {
        Appointment appointment = new Appointment();
        appointment.setEmployee(employee);
        appointment.setDoctor(doctor);
        appointment.setHospital(hospital);
        appointment.setSlot(slot);
        appointment.setReason(reason);
        appointment.setStatus(status);
        appointment.setCancelledBy(cancelledBy);
        appointment.setBookedAt(bookedAt);
        appointment.setUpdatedAt(updatedAt);
        return appointment;
    }

    private void createSymptomKeywords(Map<String, Department> departments) {
        List<SymptomKeyword> keywords = new ArrayList<>();
        keywords.add(createSymptomKeyword("chest pain", departments.get("Cardiology"), false));
        keywords.add(createSymptomKeyword("severe chest pain", departments.get("Cardiology"), true));
        keywords.add(createSymptomKeyword("can't breathe", departments.get("Cardiology"), true));
        keywords.add(createSymptomKeyword("palpitations", departments.get("Cardiology"), false));
        keywords.add(createSymptomKeyword("high blood pressure", departments.get("Cardiology"), false));
        keywords.add(createSymptomKeyword("back pain", departments.get("Orthopedics"), false));
        keywords.add(createSymptomKeyword("knee pain", departments.get("Orthopedics"), false));
        keywords.add(createSymptomKeyword("fracture", departments.get("Orthopedics"), false));
        keywords.add(createSymptomKeyword("joint stiffness", departments.get("Orthopedics"), false));
        keywords.add(createSymptomKeyword("toothache", departments.get("Dental"), false));
        keywords.add(createSymptomKeyword("bleeding gums", departments.get("Dental"), false));
        keywords.add(createSymptomKeyword("wisdom tooth pain", departments.get("Dental"), false));
        keywords.add(createSymptomKeyword("skin rash", departments.get("Dermatology"), false));
        keywords.add(createSymptomKeyword("acne", departments.get("Dermatology"), false));
        keywords.add(createSymptomKeyword("hair loss", departments.get("Dermatology"), false));
        keywords.add(createSymptomKeyword("fever", departments.get("General Medicine"), false));
        keywords.add(createSymptomKeyword("common cold", departments.get("General Medicine"), false));
        keywords.add(createSymptomKeyword("stomach ache", departments.get("General Medicine"), false));
        keywords.add(createSymptomKeyword("vomiting", departments.get("General Medicine"), false));
        keywords.add(createSymptomKeyword("sore throat", departments.get("ENT"), false));
        keywords.add(createSymptomKeyword("ear pain", departments.get("ENT"), false));
        keywords.add(createSymptomKeyword("child fever", departments.get("Pediatrics"), false));
        keywords.add(createSymptomKeyword("vaccination", departments.get("Pediatrics"), false));
        keywords.add(createSymptomKeyword("severe headache", departments.get("Neurology"), false));
        keywords.add(createSymptomKeyword("seizure", departments.get("Neurology"), true));

        symptomKeywordRepository.saveAll(keywords);
    }

    private SymptomKeyword createSymptomKeyword(String keyword, Department department, boolean emergency) {
        SymptomKeyword symptomKeyword = new SymptomKeyword();
        symptomKeyword.setKeyword(keyword);
        symptomKeyword.setDepartment(department);
        symptomKeyword.setEmergency(emergency);
        return symptomKeyword;
    }
}

const mongoose = require("mongoose");
const Role = require("../Models/Role");

// Define the roles and their permissions
const roles = [
  {
    roleName: "Doctor",
    permissions: [
      "view_profile_information",
      "update_profile_information",
      "view_patient_information",
      "view_ehr_of_patient",
    ],
  },
  {
    roleName: "Doctor (Patient Profile Management)",
    permissions: [
      "view_consultations",
      "view_surgeries",
      "view_patient_evaluations",
      "manage_patient_evaluations",
      "view_prescribe_medications",
      "view_disease_related_warnings",
    ],
  },
  {
    roleName: "Doctor (Appointment Scheduling)",
    permissions: [
      "view_appointment",
      "cancel_appointment",
      "change_appointment_status",
      "update_availability_timing",
      "view_appointment_history",
    ],
  },
  {
    roleName: "Doctor (AI Diagnostic)",
    permissions: [
      "search_for_models",
      "use_models",
      "view_diagnostic_results",
      "interpret_results",
      "request_model_training",
    ],
  },
  {
    roleName: "Doctor (Lab Diagnostic)",
    permissions: [
      "view_lab_test_results",
      "request_lab_tests",
      "communicate_results",
      "view_lab_test_catalog",
    ],
  },
  {
    roleName: "Doctor (Pharmacy)",
    permissions: [
      "view_prescriptions",
      "prescribe_medications",
      "request_prescription_updates",
    ],
  },
  {
    roleName: "Doctor (Patient Monitoring)",
    permissions: [
      "view_patient_data",
      "update_patient_thresholds",
      "acknowledge_alerts",
      "add_patient_notes",
    ],
  },
  {
    roleName: "Doctor (Health Analytics)",
    permissions: [
      "view_patient_reports",
      "generate_patient_reports",
      "request_readmission_risk",
    ],
  },
  {
    roleName: "Patient",
    permissions: [
      "view_profile_information",
      "update_profile_information",
      "view_medical_history",
      "view_appointments",
      "view_own_ehr",
      "view_prescriptions",
      "request_prescription_updates",
    ],
  },
  {
    roleName: "Patient (Profile Management)",
    permissions: [
      "view_diagnoses",
      "discuss_diagnoses",
      "view_evaluations",
      "view_medications",
    ],
  },
  {
    roleName: "Patient (Appointment Scheduling)",
    permissions: [
      "reschedule_appointment",
      "view_available_slots",
      "book_appointment",
      "view_appointment_history",
    ],
  },
  {
    roleName: "Patient (AI Diagnostic)",
    permissions: [
      "search_for_models",
      "use_models",
      "view_diagnostic_results",
      "interpret_results",
      "request_model_training",
    ],
  },
  {
    roleName: "Patient (Billing Insurance)",
    permissions: [
      "view_own_bills",
      "make_payments",
      "view_claim_status",
      "update_information",
      "submit_inquiries",
    ],
  },
  {
    roleName: "Patient (Lab Diagnostic)",
    permissions: [
      "view_lab_results",
      "book_lab_test",
      "communicate_with_doctor",
      "view_lab_test_catalog",
    ],
  },
  {
    roleName: "Patient (Monitoring Health)",
    permissions: [
      "view_health_data",
      "receive_notifications",
      "download_own_reports",
    ],
  },
  {
    roleName: "Nurse 2",
    permissions: [
      "view_lab_test_results",
      "add_lab_test_notes",
      "view_lab_test_catalog",
      "acknowledge_alerts",
      "add_patient_care_notes",
      "view_patient_medications",
    ],
  },
  {
    roleName: "Receptionist",
    permissions: [
      "view_profile",
      "update_profile",
      "view_appointments",
      "view_patient_bills",
      "update_contact_info",
    ],
  },
  {
    roleName: "Receptionist (Appointment Scheduling)",
    permissions: [
      "cancel_appointment",
      "change_appointment_status",
      "reschedule_appointment",
      "view_appointment_history",
    ],
  },
  {
    roleName: "Receptionist (Medical Billing)",
    permissions: [
      "process_payments",
      "check_basic_eligibility",
      "update_contact_info",
      "log_interactions",
      "escalate_issues",
    ],
  },
  {
    roleName: "AI Specialist",
    permissions: [
      "view_profile",
      "update_profile",
      "upload_dataset",
      "delete_dataset",
      "train_model",
    ],
  },
  {
    roleName: "AI Specialist 2",
    permissions: [
      "upload_model",
      "delete_model",
      "view_uploaded_models",
      "train_custom_model",
    ],
  },
  {
    roleName: "Manager",
    permissions: [
      "view_profile",
      "update_profile",
      "manage_bills",
      "process_payments",
    ],
  },
  {
    roleName: "Manager 2",
    permissions: [
      "generate_reports",
      "view_hospital_reports",
      "generate_hospital_reports",
      "configure_system",
      "manage_claims",
      "view_logs",
      "check_eligibility_for_claim",
    ],
  },
  {
    roleName: "Insurance Coordinator",
    permissions: [
      "view_bills",
      "view_profile",
      "update_profile",
      "track_claims",
      "check_eligibility",
    ],
  },
  {
    roleName: "Insurance Coordinator 2",
    permissions: [
      "manage_claims",
      "update_insurance_info",
      "generate_insurance_reports",
      "communicate_insurance",
    ],
  },
  {
    roleName: "Lab Technician",
    permissions: [
      "view_profile",
      "update_profile",
      "view_lab_test_bookings",
      "update_lab_test_results",
      "view_lab_test_catalog",
    ],
  },
  {
    roleName: "Lab Technician 2",
    permissions: [
      "schedule_lab_appointments",
      "manage_lab_equipment",
      "view_patient_history",
      "generate_test_reports",
      "access_test_samples",
      "manage_lab_staff",
      "view_lab_quality_control",
    ],
  },
  {
    roleName: "Pharmacist",
    permissions: [
      "view_profile",
      "update_profile",
      "view_inventory",
      "update_inventory",
      "process_prescriptions",
      "update_prescription_status",
    ],
  },
  {
    roleName: "Pharmacist 2",
    permissions: [
      "view_patient_prescriptions",
      "manage_drug_interactions",
      "process_refills",
      "monitor_drug_stock_levels",
      "generate_inventory_reports",
      "approve_medication_orders",
      "manage_billing",
      "generate_reports",
    ],
  },
  {
    roleName: "Admin",
    permissions: [
      "grant_permissions",
      "grant_role",
      "reduce_permissions",
      "remove_role",
    ],
  },
];

// MongoDB connection function
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Authentication&Authorization");
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit if connection fails
  }
};

// Function to add roles to the database
const addRolesToDB = async () => {
  try {
    await Role.insertMany(
      roles.map((role) => ({
        ...role,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
    console.log("Roles added successfully!");
  } catch (error) {
    console.error("Error adding roles:", error);
  } finally {
    mongoose.disconnect();
  }
};

// Execute the script
(async () => {
  await connectDB();
  await addRolesToDB();
})();

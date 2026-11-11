import { useState } from 'react';
import Modal from './Modal';
import { createAdminDoctor, updateAdminDoctor } from '../api/adminApi';
import { getErrorMessage } from '../utils/errors';

function validate(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = 'Name is required';
  else if (values.name.trim().length > 120)
    errors.name = 'Name must not exceed 120 characters';

  if (!values.departmentId) errors.departmentId = 'Choose a department';

  if (!values.specialization.trim())
    errors.specialization = 'Specialization is required';
  else if (values.specialization.trim().length > 120)
    errors.specialization = 'Must not exceed 120 characters';

  if (!values.qualification.trim())
    errors.qualification = 'Qualification is required';
  else if (values.qualification.trim().length > 150)
    errors.qualification = 'Must not exceed 150 characters';

  const years = Number(values.experienceYears);
  if (values.experienceYears === '') {
    errors.experienceYears = 'Experience is required';
  } else if (!Number.isInteger(years) || years < 0) {
    errors.experienceYears = 'Enter a whole number, zero or more';
  }

  return errors;
}

// doctor = existing doctor to edit, or null to add a new one
export default function DoctorFormModal({
  doctor,
  departments,
  onClose,
  onSaved,
}) {
  const editing = Boolean(doctor);

  const [values, setValues] = useState({
    name: doctor?.name ?? '',
    departmentId: doctor?.department?.id ? String(doctor.department.id) : '',
    specialization: doctor?.specialization ?? '',
    qualification: doctor?.qualification ?? '',
    experienceYears:
      doctor?.experienceYears != null ? String(doctor.experienceYears) : '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  function change(key) {
    return (event) => {
      setValues((current) => ({ ...current, [key]: event.target.value }));
      if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;

    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const body = {
      name: values.name.trim(),
      departmentId: Number(values.departmentId),
      specialization: values.specialization.trim(),
      qualification: values.qualification.trim(),
      experienceYears: Number(values.experienceYears),
    };

    setSubmitting(true);
    setServerError('');

    try {
      const saved = editing
        ? await updateAdminDoctor(doctor.id, body)
        : await createAdminDoctor(body);
      onSaved(saved, editing ? 'updated' : 'added');
    } catch (error) {
      setServerError(getErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title={editing ? 'Edit doctor' : 'Add a doctor'}
      onClose={submitting ? () => {} : onClose}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="doc-name">Full name</label>
          <input
            id="doc-name"
            className="input"
            maxLength={120}
            placeholder="Dr. Priya Nair"
            value={values.name}
            onChange={change('name')}
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="doc-department">Department</label>
            <select
              id="doc-department"
              className="input"
              value={values.departmentId}
              onChange={change('departmentId')}
              aria-invalid={Boolean(errors.departmentId)}
            >
              <option value="">Select…</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.departmentId && (
              <p className="field-error">{errors.departmentId}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="doc-specialization">Specialization</label>
            <input
              id="doc-specialization"
              className="input"
              maxLength={120}
              placeholder="Cardiology"
              value={values.specialization}
              onChange={change('specialization')}
              aria-invalid={Boolean(errors.specialization)}
            />
            {errors.specialization && (
              <p className="field-error">{errors.specialization}</p>
            )}
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="doc-qualification">Qualification</label>
            <input
              id="doc-qualification"
              className="input"
              maxLength={150}
              placeholder="MBBS, MD"
              value={values.qualification}
              onChange={change('qualification')}
              aria-invalid={Boolean(errors.qualification)}
            />
            {errors.qualification && (
              <p className="field-error">{errors.qualification}</p>
            )}
          </div>

          <div className="field">
            <label htmlFor="doc-experience">Experience (years)</label>
            <input
              id="doc-experience"
              className="input"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="8"
              value={values.experienceYears}
              onChange={change('experienceYears')}
              aria-invalid={Boolean(errors.experienceYears)}
            />
            {errors.experienceYears && (
              <p className="field-error">{errors.experienceYears}</p>
            )}
          </div>
        </div>

        {serverError && (
          <div className="alert-error" role="alert">
            {serverError}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting
              ? 'Saving…'
              : editing
                ? 'Save changes'
                : 'Add doctor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

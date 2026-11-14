import React, { useRef, useState } from "react";
import { Btn } from "./ui";

const MAX_BYTES = 5 * 1024 * 1024;

/** Returns an error message, or "" when the file is an acceptable photo. */
export function validateImage(file) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return "Please choose a JPG, PNG or WEBP image.";
  if (file.size > MAX_BYTES) return "The image must be 5 MB or smaller.";
  return "";
}

/**
 * Photo picker used when adding a hospital (super admin) or a doctor (hospital admin).
 * Picking a file uploads it straight away through `upload(file)` -> { url } and reports the
 * Cloudinary URL with onChange(url). The form then simply submits that URL.
 */
export function ImageUploader({ label, value, onChange, upload }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (event) => {
    const file = event.target.files && event.target.files[0];
    event.target.value = ""; // allow choosing the same file again later
    if (!file) return;
    const problem = validateImage(file);
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { url } = await upload(file);
      onChange(url);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="image-uploader">
      <span className="image-uploader-label">{label}</span>
      <div className="image-uploader-row">
        {value ? <img src={value} alt="Preview" /> : <div className="image-uploader-empty">No image</div>}
        <div className="image-uploader-actions">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} />
          <Btn type="button" kind="outline" disabled={busy} onClick={() => inputRef.current.click()}>
            {busy ? "Uploading…" : value ? "Change image" : "Choose image"}
          </Btn>
          {value && !busy && (
            <Btn type="button" kind="danger-outline" onClick={() => onChange("")}>
              Remove
            </Btn>
          )}
        </div>
      </div>
      <small className="image-uploader-hint">JPG, PNG or WEBP · max 5 MB</small>
      {error && <p className="login-error">{error}</p>}
    </div>
  );
}

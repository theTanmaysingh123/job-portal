import { useEffect, useState } from "react";
import API, { FILE_BASE_URL } from "../services/api";
import { useToast } from "../context/ToastContext";

function Profile() {
  const { showToast } = useToast();
  const token = localStorage.getItem("token");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
    phone: "",
    bio: "",
    location: "",
    profilePhoto: "",
  });

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    setFetching(true);
    try {
      const res = await API.get("/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (error) {
      console.log(error);
      showToast("Failed to load profile", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);

      const res = await API.post("/auth/profile/photo", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      showToast(res.data.message, "success");
      setProfile((prev) => ({ ...prev, profilePhoto: res.data.user.profilePhoto }));

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, profilePhoto: res.data.user.profilePhoto })
      );
    } catch (error) {
      console.log(error);
      showToast(error.response?.data?.message || "Failed to upload photo", "error");
    } finally {
      setUploadingPhoto(false);
      e.target.value = "";
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!profile.name.trim()) newErrors.name = "Name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const res = await API.put(
        "/auth/profile",
        {
          name: profile.name,
          phone: profile.phone,
          bio: profile.bio,
          location: profile.location,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showToast(res.data.message, "success");

      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, name: res.data.user.name })
      );

      setProfile(res.data.user);
    } catch (error) {
      console.log(error);
      showToast(error.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const initials = (name) =>
    (name || "?")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  if (fetching) {
    return (
      <div className="container section-py text-center">
        <span className="spinner-border text-primary"></span>
      </div>
    );
  }

  return (
    <div className="container section-py">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="jp-form-card jp-animate-up">
            <div className="jp-form-header">
              <div className="jp-avatar-upload">
                {profile.profilePhoto ? (
                  <img
                    src={`${FILE_BASE_URL}/${profile.profilePhoto}`}
                    alt="Profile"
                    className="jp-avatar-photo"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPhotoPreview(true)}
                    title="Click to view full size"
                  />
                ) : (
                  <span className="icon-box fw-bold">{initials(profile.name)}</span>
                )}

                <label className="jp-avatar-edit-btn" title="Change photo">
                  {uploadingPhoto ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : (
                    <i className="bi bi-camera-fill"></i>
                  )}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    hidden
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>

              <div>
                <h3 className="mb-0">My Profile</h3>
                <p className="text-muted mb-0">
                  <span className="jp-badge jp-badge-blue">
                    <i className="bi bi-person-badge"></i> {profile.role}
                  </span>
                </p>
              </div>
            </div>

            <form onSubmit={handleSave}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    value={profile.name}
                    onChange={handleChange}
                  />
                  {errors.name && (
                    <div className="text-danger small mt-1">{errors.name}</div>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={profile.email}
                    disabled
                    title="Email cannot be changed"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="e.g. +91 98765 43210"
                    value={profile.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    name="location"
                    className="form-control"
                    placeholder="e.g. Noida, India"
                    value={profile.location}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">
                    {profile.role === "recruiter" ? "About your company" : "About you"}
                  </label>
                  <textarea
                    rows="4"
                    name="bio"
                    className="form-control"
                    placeholder={
                      profile.role === "recruiter"
                        ? "Tell candidates about your company..."
                        : "Tell recruiters a bit about yourself..."
                    }
                    value={profile.bio}
                    onChange={handleChange}
                  ></textarea>
                </div>
              </div>

              <button
                type="submit"
                className="btn-jp-submit btn-lift mt-4"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {showPhotoPreview && profile.profilePhoto && (
        <div
          className="jp-modal-backdrop"
          onClick={() => setShowPhotoPreview(false)}
        >
          <div
            className="jp-photo-preview-card"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={`${FILE_BASE_URL}/${profile.profilePhoto}`}
              alt="Profile large preview"
              className="jp-photo-preview-img"
            />
            <button
              className="btn btn-jp-outline btn-lift mt-3"
              style={{ color: "var(--jp-blue)", borderColor: "var(--jp-blue-tint-2)" }}
              onClick={() => setShowPhotoPreview(false)}
            >
              <i className="bi bi-x-lg"></i> Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
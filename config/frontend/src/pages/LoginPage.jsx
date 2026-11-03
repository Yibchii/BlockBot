import {useState} from "react";
import "./LoginPage.css";
import logo from "../../public/images/logo.png";


const initialForm = {
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
    classroomCode: "",
    classroomName: "",
};

function Gear({color, position, reverse = false, duration = "26s"}) {
    const points = Array.from({length: 48}, (_, index) => {
        const angle = (index * Math.PI * 2) / 48 - Math.PI / 2;
        const radius = index % 4 === 0 || index % 4 === 3 ? 100 : 81;
        return `${120 + radius * Math.cos(angle)}, ${120 + radius * Math.sin(angle)}`;
    }).join(" ");

    return (
        <svg
            className = {`bb-gear bb-gear--${position} ${reverse ? "bb-gear--reverse" : ""}`}
            style = {{"--gear-duration" : duration}}
            viewBox = "0 0 240 240"
            aria-hidden = "true"
            focusable = "false"

        >
            <polygon points={points} fill={color} />
            <circle cx = "120" cy = "120" r = "46" fill = "#fff" />
        </svg>
    );
}

function TeacherIcon({ className = "" }) {
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="17" y="5" width="28" height="24" rx="3" stroke="currentColor" strokeWidth="3" />
        <path d="M24 34H40M32 29V34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        <circle cx="11" cy="29" r="6" fill="currentColor" />
        <path d="M2 44V41C2 36 6 33 11 33C16 33 20 36 20 41V44" fill="currentColor" />
        <path d="M24 15L30 20L39 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

function Field({ label, name, value, onChange, type = "text", autoComplete, required = true, minLength }) {
  return (
    <label className="bb-field">
      <span>{label}{required && <span className="bb-required"> *</span>}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
      />
    </label>
  );
}

export default function LoginPage() {
  const [role, setRole] = useState("student");
  const [screen, setScreen] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setMessage("");
  };

  const changeScreen = (nextScreen) => {
    setScreen(nextScreen);
    setForm(initialForm);
    setMessage("");
    setShowPassword(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (screen === "register") {
      if (form.password !== form.confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
      // TODO: Send this data to Django. Do NOT create a real account in client state.
      // POST /api/auth/register/ (endpoint to agree on with backend team)
      setMessage(`The ${role} form is ready. Connect the Django registration endpoint to create accounts.`);
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/user/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "same-origin",
        body: new URLSearchParams({
          username: form.username,
          password: form.password,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Unable to log in (${response.status})`);
      }

      window.dispatchEvent(new Event("blockbot:login"));
      setMessage(data.message || "Login successful.");
      window.location.assign("/home");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setIsSubmitting(false);
    }
  };

    const student = role === "student";
    return (
    <main className="bb-page">
      <div className="bb-gears" aria-hidden="true">
        <Gear color="#f3942e" position="top-left" duration="28s" />
        <Gear color="#b92b1e" position="top-right" reverse duration="24s" />
        <Gear color="#19159c" position="bottom-left" duration="31s" />
        <Gear color="#8251ed" position="bottom-center" reverse duration="27s" />
        <Gear color="#4fa45d" position="bottom-right" duration="33s" />
      </div>

      <div className="bb-layout">
        <section className="bb-auth-card" aria-label={screen === "login" ? "Log in" : "Create an account"}>
          <img className="bb-logo bb-logo--form" src={logo} alt="BlockBot" />
          {screen === "login" ? (
            <>
              <p className="bb-card-subtitle">Log in to your account</p>
              <div className="bb-role-switch" role="group" aria-label="Account type">
                <button className={student ? "active" : ""} type="button" aria-pressed={student} onClick={() => { setRole("student"); setMessage(""); }}>🎓 Student</button>
                <button className={!student ? "active" : ""} type="button" aria-pressed={!student} onClick={() => { setRole("teacher"); setMessage(""); }}><TeacherIcon className="bb-switch-icon" /> Teacher</button>
              </div>
              <form className="bb-form" onSubmit={handleSubmit}>
                <Field label={student ? "Username or School ID" : "Username"} name="username" value={form.username} onChange={updateForm} autoComplete="username" />
                <Field label="Password" name="password" value={form.password} onChange={updateForm} type={showPassword ? "text" : "password"} autoComplete="current-password" />
                <div className="bb-options">
                  <label className="bb-check"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /> Remember me</label>
                  <button type="button" className="bb-link" onClick={() => changeScreen("forgot")}>Forgot password?</button>
                </div>
                <button className="bb-primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Logging In..." : "Log In →"}
                </button>
              </form>
              <div className="bb-separator"><span>or</span></div>
              <button className="bb-outline" type="button" onClick={() => changeScreen("register")}>Create an Account</button>
              <button className="bb-guest" type="button" onClick={() => window.location.assign("/editor")}>Continue as Guest</button>
            </>
          ) : screen === "register" ? (
            <>
              <button className="bb-back" type="button" onClick={() => changeScreen("login")}>← Back to Login</button>
              <h1 className="bb-form-title">Create a {student ? "Student" : "Teacher"} Account</h1>
              <p className="bb-card-subtitle">{student ? "Join your classroom and start building!" : "Set up your classroom and start teaching!"}</p>
              <div className="bb-role-switch" role="group" aria-label="Registration account type">
                <button className={student ? "active" : ""} type="button" aria-pressed={student} onClick={() => { setRole("student"); setMessage(""); }}>🎓 Student</button>
                <button className={!student ? "active" : ""} type="button" aria-pressed={!student} onClick={() => { setRole("teacher"); setMessage(""); }}><TeacherIcon className="bb-switch-icon" /> Teacher</button>
              </div>
              <form className="bb-form" onSubmit={handleSubmit}>
                <Field label={student ? "School ID or Username" : "Username"} name="username" value={form.username} onChange={updateForm} autoComplete="username" />
                {!student && <Field label="Email" name="email" value={form.email} onChange={updateForm} type="email" autoComplete="email" />}
                <div className="bb-name-row">
                  <Field label="First Name" name="firstName" value={form.firstName} onChange={updateForm} autoComplete="given-name" />
                  <Field label="Last Name" name="lastName" value={form.lastName} onChange={updateForm} autoComplete="family-name" />
                </div>
                <Field label="Password" name="password" value={form.password} onChange={updateForm} type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} />
                <Field label="Confirm Password" name="confirmPassword" value={form.confirmPassword} onChange={updateForm} type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} />
                <label className="bb-check"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Show passwords</label>
                {student ? (
                  <Field label="Classroom Code" name="classroomCode" value={form.classroomCode} onChange={updateForm} />
                ) : (
                  <Field label="Classroom Name" name="classroomName" value={form.classroomName} onChange={updateForm} />
                )}
                <button className={`bb-primary ${!student ? "bb-primary--green" : ""}`} type="submit">Create Account</button>
              </form>
              <p className="bb-bottom-note">Already have an account? <button type="button" className="bb-link" onClick={() => changeScreen("login")}>Log In</button></p>
            </>
          ) : (
            <>
              <button className="bb-back" type="button" onClick={() => changeScreen("login")}>← Back to Login</button>
              <h1 className="bb-form-title">Reset Password</h1>
              <p className="bb-card-subtitle">Password recovery will be available when it is implemented in Django.</p>
            </>
          )}
          {message && (
            <p role="status" className={`bb-message ${message === "Login failed" ? "bb-message--error" : ""}`}>
              {message}
            </p>
          )}
        </section>

        <section className="bb-welcome" aria-label="About BlockBot">
          <h2>Welcome to</h2>
          <img className="bb-logo bb-logo--welcome" src={logo} alt="BlockBot" />
          <p className="bb-tagline">Learn <span>·</span> Teach <span>·</span> Build</p>
          <div className="bb-info-grid">
            <article className="bb-info bb-info--student">
              <span className="bb-info-icon" aria-hidden="true">🎓</span>
              <h3>Student Account</h3>
              <p>Join your classroom, complete assignments and challenges, create projects, and track your progress.</p>
            </article>
            <article className="bb-info bb-info--teacher">
              <TeacherIcon className="bb-info-icon" />
              <h3>Teacher Account</h3>
              <p>Create and manage classrooms, assignments, and challenges, monitor progress, and provide feedback.</p>
            </article>
          </div>
        </section>
      </div>
    </main>
    );
}
import {useState} from "react";
import "./LoginPage.css";
import logo from "./public/images/logo.png";


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

function Field({label, name, value, onChange, type = "text", autoComplete, require = true, minLength}){
    return (
        <label className = "bb-field">
            <span>{label}{required && <span className = "bb-required"> *</span>}</span>
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
    const [remember, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState("");

    const updateForm = (event) => {
        const {name, value} = event.target;
        setForm((previous) => ({... previous, [name]: value}));
        setMessage("");
    };

    const changeScreen = (nextScreen) => {
        setScreen(nextScreen);
        setForm(initialForm);
        setMessage("");
        setShowPassword(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (screen === "register") {
            if (form.password !== form.confirmPassword) {
                setMessage("Passwords do not match.");
                return;
            }
            // TODO: sent data to django and do not create real account in client state
            setMessage(`The ${role} form is read. Connect the Django registration endpoint to create accounts.`);
            return;
        }
        // TODO: authenticate with django and let server establish reaul user's role
        setMessage(`Login form is read. Connect the Django authentication endpoint to sign in.`);
    };

    const student = role === "student";
    return (
        <div className="">
            <h1>Login Page</h1>
        </div>
    );
}
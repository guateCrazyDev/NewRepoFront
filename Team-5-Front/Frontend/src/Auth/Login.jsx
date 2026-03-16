import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginRequest } from "/src/service/AuthService";
import "./Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await loginRequest({ username, password });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="LoginPage-Container">
      <form onSubmit={onSubmit}>
        <div id="image-container">
          <img id="icon" src="../public/images/SkyRoute.ico" alt="" />
        </div>
        <h1>Welcome back</h1>
        <input
          placeholder="User"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {error && <div className="error">{error}</div>}
        <Link id="CreateAccount" to={"../register"}>
          Don't have an account
        </Link>
      </form>
    </div>
  );
}

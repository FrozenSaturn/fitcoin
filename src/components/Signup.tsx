import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import "./Signup.css"; // Importing the CSS file

interface SignupProps {
  navigate: (path: string) => void;
}

const Signup: React.FC<SignupProps> = ({ navigate }) => {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName });

      // Create a new user document
      await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName,
        email,
        createdAt: serverTimestamp(),
      });

      navigate("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="signup-container">
      <form onSubmit={handleSignup} className="signup-form">
        <h2 className="form-title">Sign Up</h2>
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="form-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="form-input"
        />
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="form-button">
          Sign Up
        </button>
        <p className="form-text">
          Already have an account?{" "}
          <span
            className="form-link"
            onClick={() => navigate("/login")}
            style={{ cursor: "pointer" }}
          >
            Log In
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signup;

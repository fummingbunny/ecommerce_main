import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ─────────────────────────────────────────
  // HANDLE REGISTER
  // ─────────────────────────────────────────

  const handleRegister = async () => {
    // validation
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await register(name, email, password);

      // success → go to home
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Card
        sx={{
          width: { xs: "90%", sm: 420 },
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          {/* HEADER */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                color: "#ff3f6c",
              }}
            >
              🛍️ ShopEasy
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Create your account
            </Typography>
          </Box>

          {/* ERROR ALERT */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* NAME FIELD */}
          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            disabled={loading}
          />

          {/* EMAIL FIELD */}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            disabled={loading}
          />

          {/* PASSWORD FIELD */}
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 2 }}
            disabled={loading}
            helperText="Minimum 6 characters"
          />

          {/* CONFIRM PASSWORD */}
          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            sx={{ mb: 3 }}
            disabled={loading}
            error={confirmPassword !== "" && password !== confirmPassword}
            helperText={
              confirmPassword !== "" && password !== confirmPassword
                ? "Passwords do not match"
                : ""
            }
          />

          {/* REGISTER BUTTON */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleRegister}
            disabled={loading}
            sx={{
              backgroundColor: "#ff3f6c",
              "&:hover": {
                backgroundColor: "#cc3357",
              },
              borderRadius: 2,
              py: 1.5,
              mb: 2,
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create Account"
            )}
          </Button>

          <Divider sx={{ mb: 2 }}>OR</Divider>

          {/* LOGIN LINK */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#ff3f6c",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Login here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;

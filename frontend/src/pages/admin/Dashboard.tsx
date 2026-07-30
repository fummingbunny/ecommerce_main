import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import {
  People,
  Inventory,
  ShoppingCart,
  AttachMoney,
  Pending,
} from "@mui/icons-material";
import { adminAPI } from "../../api/axios";
import type { DashboardStats } from "../../types";

// ─────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card sx={{ borderRadius: 2, height: "100%" }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: 2,
            p: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: color, // ← color on Box instead
            fontSize: 32, // ← size on Box instead
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─────────────────────────────────────────
// DASHBOARD PAGE
// ─────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [newOrders, setNewOrders] = useState<any[]>([]);

  const wsRef = useRef<WebSocket | null>(null);

  // ─────────────────────────────────────────
  // FETCH STATS
  // ─────────────────────────────────────────

  useEffect(() => {
    fetchStats();
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setStats(response.data);
    } catch (err) {
      setError("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // WEBSOCKET — LIVE DASHBOARD
  // ─────────────────────────────────────────

  const connectWebSocket = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/admin?token=${token}`);

    ws.onopen = () => {
      console.log("Admin WebSocket connected!");
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Admin message:", message);

      if (message.type === "new_order") {
        // add to new orders list
        setNewOrders((prev) => [message, ...prev]);

        // update total orders count
        setStats((prev) =>
          prev
            ? {
                ...prev,
                total_orders: prev.total_orders + 1,
                pending_orders: prev.pending_orders + 1,
                total_revenue: prev.total_revenue + message.total,
              }
            : null,
        );
      }

      if (message.type === "order_updated") {
        // refresh stats when order status changes
        fetchStats();
      }
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    ws.onerror = () => {
      setWsConnected(false);
    };

    wsRef.current = ws;
  };

  // ─────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#ff3f6c" }} size={50} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Admin Dashboard
        </Typography>

        {/* WEBSOCKET STATUS */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: wsConnected ? "success.main" : "error.main",
            }}
          />
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {wsConnected ? "Live" : "Offline"}
          </Typography>
        </Box>
      </Box>

      {/* STATS GRID */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            icon={<People sx={{ fontSize: 32 }} />}
            color="#2196f3"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Products"
            value={stats?.total_products || 0}
            icon={<Inventory sx={{ fontSize: 32 }} />}
            color="#ff9800"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Orders"
            value={stats?.total_orders || 0}
            icon={<ShoppingCart sx={{ fontSize: 32 }} />}
            color="#ff3f6c"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
            icon={<AttachMoney sx={{ fontSize: 32 }} />}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* PENDING ORDERS */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Pending sx={{ color: "#ff9800" }} />
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Pending Orders
            </Typography>
            <Chip
              label={stats?.pending_orders || 0}
              color="warning"
              size="small"
              sx={{ fontWeight: "bold" }}
            />
          </Box>
          <Typography sx={{ color: "text.secondary" }}>
            {stats?.pending_orders === 0
              ? "No pending orders! 🎉"
              : `${stats?.pending_orders} orders waiting to be confirmed`}
          </Typography>
        </CardContent>
      </Card>

      {/* LIVE NEW ORDERS */}
      {newOrders.length > 0 && (
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
              🔔 Live New Orders
            </Typography>
            {newOrders.map((order, index) => (
              <Alert key={index} severity="success" sx={{ mb: 1 }}>
                {order.message} — ₹{order.total?.toLocaleString()}
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Dashboard;

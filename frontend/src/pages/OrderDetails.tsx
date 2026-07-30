import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { ArrowBack, LocationOn, LocalShipping } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { ordersAPI } from "../api/axios";
import type { Order } from "../types";

// ─────────────────────────────────────────
// ORDER STATUS STEPS
// ─────────────────────────────────────────

const orderSteps = ["Pending", "Confirmed", "Shipped", "Delivered"];

const getStepIndex = (status: string) => {
  switch (status) {
    case "pending":
      return 0;
    case "confirmed":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "warning";
    case "confirmed":
      return "info";
    case "shipped":
      return "primary";
    case "delivered":
      return "success";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
};

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [notification, setNotification] = useState("");

  // websocket ref
  const wsRef = useRef<WebSocket | null>(null);

  // ─────────────────────────────────────────
  // FETCH ORDER
  // ─────────────────────────────────────────

  useEffect(() => {
    if (id) {
      fetchOrder();
      connectWebSocket();
    }

    // cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getOrder(parseInt(id!));
      setOrder(response.data);
    } catch (err) {
      setError("Order not found!");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // WEBSOCKET CONNECTION
  // ─────────────────────────────────────────

  const connectWebSocket = () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const ws = new WebSocket(
      `ws://localhost:8000/ws/orders/${id}?token=${token}`,
    );

    ws.onopen = () => {
      console.log("WebSocket connected!");
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("WebSocket message:", message);

      if (message.type === "order_status_update") {
        // update order status in real time!
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                status: message.status,
              }
            : null,
        );

        // show notification
        setNotification(message.message);

        // clear notification after 5 seconds
        setTimeout(() => setNotification(""), 5000);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected!");
      setWsConnected(false);
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
      setWsConnected(false);
    };

    wsRef.current = ws;
  };

  // ─────────────────────────────────────────
  // LOADING STATE
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

  if (error || !order) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          onClick={() => navigate("/orders")}
          startIcon={<ArrowBack />}
          sx={{ color: "#ff3f6c" }}
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* BACK BUTTON */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/orders")}
        sx={{ color: "#ff3f6c", mb: 2 }}
      >
        Back to Orders
      </Button>

      {/* REAL TIME NOTIFICATION */}
      {notification && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setNotification("")}
        >
          🔔 {notification}
        </Alert>
      )}

      {/* WEBSOCKET STATUS */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            backgroundColor: wsConnected ? "success.main" : "error.main",
          }}
        />
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {wsConnected ? "Live tracking active" : "Connecting..."}
        </Typography>
      </Box>

      {/* ORDER HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Order #{order.id}
        </Typography>
        <Chip
          label={order.status.toUpperCase()}
          color={getStatusColor(order.status) as any}
          sx={{ fontWeight: "bold", fontSize: 14 }}
        />
      </Box>

      {/* ORDER DATE */}
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        Placed on{" "}
        {new Date(order.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Typography>

      {/* ORDER STATUS STEPPER */}
      {order.status !== "cancelled" ? (
        <Card sx={{ borderRadius: 2, mb: 3 }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
              <LocalShipping sx={{ mr: 1, color: "#ff3f6c" }} />
              Order Tracking
            </Typography>
            <Stepper activeStep={getStepIndex(order.status)}>
              {orderSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      ) : (
        <Alert severity="error" sx={{ mb: 3 }}>
          This order has been cancelled
        </Alert>
      )}

      {/* ORDER ITEMS */}
      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Order Items ({order.items.length})
          </Typography>

          {order.items.map((item, index) => (
            <Box key={item.id}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  py: 2,
                }}
              >
                {/* PRODUCT IMAGE */}
                <img
                  src={
                    item.product.image_url ||
                    `https://picsum.photos/seed/${item.product.id}/80/80`
                  }
                  alt={item.product.name}
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: 8,
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(`/products/${item.product.id}`)}
                />

                {/* PRODUCT DETAILS */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      cursor: "pointer",
                      "&:hover": { color: "#ff3f6c" },
                    }}
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  >
                    {item.product.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {item.product.category.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Qty: {item.quantity} × ₹
                    {item.price_at_purchase.toLocaleString()}
                  </Typography>
                </Box>

                {/* ITEM TOTAL */}
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#ff3f6c",
                  }}
                >
                  ₹{(item.price_at_purchase * item.quantity).toLocaleString()}
                </Typography>
              </Box>

              {/* DIVIDER between items */}
              {index < order.items.length - 1 && <Divider />}
            </Box>
          ))}

          <Divider sx={{ mt: 2, mb: 2 }} />

          {/* ORDER TOTAL */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontWeight: "bold" }}>Order Total</Typography>
            <Typography
              sx={{
                fontWeight: "bold",
                color: "#ff3f6c",
                fontSize: 18,
              }}
            >
              ₹{order.total_amount.toLocaleString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* SHIPPING ADDRESS */}
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            <LocationOn sx={{ mr: 1, color: "#ff3f6c" }} />
            Shipping Address
          </Typography>
          <Typography sx={{ color: "text.secondary" }}>
            {order.shipping_address}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default OrderDetail;

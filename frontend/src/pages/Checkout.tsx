import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
  Grid,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { ShoppingCart, LocalShipping, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { ordersAPI } from "../api/axios";

const steps = ["Cart Review", "Shipping Address", "Order Confirmed"];

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  // stepper
  const [activeStep, setActiveStep] = useState(0);

  // form
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  // ─────────────────────────────────────────
  // PLACE ORDER
  // ─────────────────────────────────────────

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      setError("Please enter shipping address");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await ordersAPI.placeOrder(address);

      console.log("order placed response: ", response);
      setOrderId(response.data.id);
      await clearCart();
      setActiveStep(2); // go to confirmation step
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // EMPTY CART CHECK
  // ─────────────────────────────────────────

  if ((!cart || cart.items.length === 0) && activeStep != 2) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 3,
        }}
      >
        <ShoppingCart sx={{ fontSize: 100, color: "#ddd" }} />
        <Typography variant="h5" sx={{ color: "text.secondary" }}>
          Your cart is empty!
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/products")}
          sx={{ backgroundColor: "#ff3f6c" }}
        >
          Browse Products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* HEADER */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Checkout
      </Typography>

      {/* STEPPER */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ─────────────────────────────────────────
                STEP 0 — CART REVIEW
            ───────────────────────────────────────── */}
      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Review Your Items
          </Typography>

          {/* ITEMS LIST */}
          {cart &&
            cart.items.map((item) => (
              <Card key={item.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <img
                        src={
                          item.product.image_url ||
                          `https://picsum.photos/seed/${item.product.id}/60/60`
                        }
                        alt={item.product.name}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: "bold" }}>
                          {item.product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Qty: {item.quantity}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{
                        fontWeight: "bold",
                        color: "#ff3f6c",
                      }}
                    >
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}

          {/* ORDER TOTAL */}
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ color: "text.secondary" }}>
                  Subtotal
                </Typography>
                <Typography>
                  ₹{cart && cart.total_price.toLocaleString()}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ color: "text.secondary" }}>
                  Delivery
                </Typography>
                <Typography sx={{ color: "success.main" }}>FREE</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ fontWeight: "bold" }}>Total</Typography>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#ff3f6c",
                  }}
                >
                  ₹{cart && cart.total_price.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Button
            fullWidth
            variant="contained"
            size="large"
            endIcon={<LocalShipping />}
            onClick={() => setActiveStep(1)}
            sx={{
              backgroundColor: "#ff3f6c",
              borderRadius: 2,
              py: 1.5,
            }}
          >
            Continue to Shipping
          </Button>
        </Box>
      )}

      {/* ─────────────────────────────────────────
                STEP 1 — SHIPPING ADDRESS
            ───────────────────────────────────────── */}
      {activeStep === 1 && (
        <Box>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 3 }}>
            Shipping Address
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Full Shipping Address"
            placeholder="Enter your complete address including street, city, state and pincode"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* ORDER SUMMARY */}
          <Card sx={{ borderRadius: 2, mb: 3 }}>
            <CardContent>
              <Typography sx={{ fontWeight: "bold", mb: 1 }}>
                Order Summary
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography sx={{ color: "text.secondary" }}>
                  {cart && cart.total_items} items
                </Typography>
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "#ff3f6c",
                  }}
                >
                  ₹{cart && cart.total_price.toLocaleString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setActiveStep(0)}
                sx={{
                  borderColor: "#ff3f6c",
                  color: "#ff3f6c",
                }}
              >
                Back
              </Button>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handlePlaceOrder}
                disabled={loading}
                sx={{
                  backgroundColor: "#ff3f6c",
                  borderRadius: 2,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Place Order"
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* ─────────────────────────────────────────
                STEP 2 — ORDER CONFIRMED
            ───────────────────────────────────────── */}
      {activeStep === 2 && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            py: 4,
            gap: 3,
          }}
        >
          <CheckCircle sx={{ fontSize: 100, color: "success.main" }} />

          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Order Placed! 🎉
          </Typography>

          <Typography variant="h6" sx={{ color: "text.secondary" }}>
            Order #{orderId}
          </Typography>

          <Typography
            variant="body1"
            sx={{ color: "text.secondary", textAlign: "center" }}
          >
            Your order has been placed successfully! You will receive updates on
            your order status.
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="contained"
              onClick={() => navigate(`/orders/${orderId}`)}
              sx={{ backgroundColor: "#ff3f6c" }}
            >
              Track Order
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate("/products")}
              sx={{
                borderColor: "#ff3f6c",
                color: "#ff3f6c",
              }}
            >
              Continue Shopping
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default Checkout;

import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Grid,
} from "@mui/material";
import {
  ShoppingCart,
  Delete,
  Add,
  Remove,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import type { CartItem } from "../types";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading, updateCartItem, removeFromCart, clearCart } =
    useCart();

  const [removingId, setRemovingId] = useState<number | null>(null);

  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  const handleQuantityChange = async (
    itemId: number,
    newQuantity: number,
    maxStock: number,
  ) => {
    console.log("ItemId: ", itemId);
    console.log("newQuantity: ", newQuantity);
    console.log("maxStock: ", maxStock);
    if (newQuantity < 1 || newQuantity > maxStock) return;
    await updateCartItem(itemId, newQuantity);
  };

  const handleRemove = async (itemId: number) => {
    setRemovingId(itemId);
    await removeFromCart(itemId);
    setRemovingId(null);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  // ─────────────────────────────────────────
  // EMPTY CART
  // ─────────────────────────────────────────

  if (!cart || cart.items.length === 0) {
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
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Add some products to get started
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/products")}
          sx={{
            backgroundColor: "#ff3f6c",
            borderRadius: 2,
            px: 4,
          }}
        >
          Browse Products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          My Cart
          <Typography
            component="span"
            variant="body1"
            sx={{ color: "text.secondary", ml: 2 }}
          >
            ({cart.total_items} items)
          </Typography>
        </Typography>

        <Button
          variant="outlined"
          color="error"
          onClick={handleClearCart}
          disabled={loading}
        >
          Clear Cart
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* LEFT — Cart Items */}
        <Grid size={{ xs: 12, md: 8 }}>
          {cart.items.map((item: CartItem) => (
            <Card
              key={item.id}
              sx={{
                mb: 2,
                borderRadius: 2,
                opacity: removingId === item.id ? 0.5 : 1,
                transition: "opacity 0.3s",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    alignItems: "center",
                  }}
                >
                  {/* PRODUCT IMAGE */}
                  <img
                    src={
                      item.product.image_url ||
                      `https://picsum.photos/seed/${item.product.id}/100/100`
                    }
                    alt={item.product.name}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "cover",
                      borderRadius: 8,
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  />

                  {/* PRODUCT DETAILS */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        cursor: "pointer",
                        "&:hover": { color: "#ff3f6c" },
                      }}
                      onClick={() => navigate(`/products/${item.product.id}`)}
                    >
                      {item.product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      {item.product.category.name}
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{ color: "#ff3f6c", fontWeight: "bold" }}
                    >
                      ₹{item.product.price.toLocaleString()}
                    </Typography>
                  </Box>

                  {/* QUANTITY + REMOVE */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    {/* QUANTITY CONTROLS */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        border: "1px solid #ddd",
                        borderRadius: 2,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity - 1,
                            item.product.stock,
                          )
                        }
                        disabled={item.quantity <= 1 || loading}
                        sx={{ color: "#ff3f6c" }}
                      >
                        <Remove fontSize="small" />
                      </IconButton>

                      <Typography
                        sx={{
                          px: 2,
                          fontWeight: "bold",
                          minWidth: 30,
                          textAlign: "center",
                        }}
                      >
                        {item.quantity}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={() =>
                          handleQuantityChange(
                            item.id,
                            item.quantity + 1,
                            item.product.stock,
                          )
                        }
                        disabled={
                          item.quantity >= item.product.stock || loading
                        }
                        sx={{ color: "#ff3f6c" }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>

                    {/* ITEM TOTAL */}
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      Total: ₹
                      {(item.product.price * item.quantity).toLocaleString()}
                    </Typography>

                    {/* REMOVE BUTTON */}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(item.id)}
                      disabled={loading}
                    >
                      {removingId === item.id ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Delete fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Grid>

        {/* RIGHT — Order Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              borderRadius: 2,
              position: "sticky",
              top: 80,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Order Summary
              </Typography>

              <Divider sx={{ mb: 2 }} />

              {/* ITEMS */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography sx={{ color: "text.secondary" }}>
                  Items ({cart.total_items})
                </Typography>
                <Typography>₹{cart.total_price.toLocaleString()}</Typography>
              </Box>

              {/* DELIVERY */}
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

              <Divider sx={{ my: 2 }} />

              {/* TOTAL */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#ff3f6c",
                  }}
                >
                  ₹{cart.total_price.toLocaleString()}
                </Typography>
              </Box>

              {/* CHECKOUT BUTTON */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/checkout")}
                disabled={loading}
                sx={{
                  backgroundColor: "#ff3f6c",
                  "&:hover": { backgroundColor: "#cc3357" },
                  borderRadius: 2,
                  py: 1.5,
                  fontWeight: "bold",
                }}
              >
                Proceed to Checkout
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => navigate("/products")}
                sx={{ mt: 1, color: "#ff3f6c" }}
              >
                Continue Shopping
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Cart;

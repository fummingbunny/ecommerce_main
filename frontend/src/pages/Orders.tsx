import React, { useState, useEffect } from "react";
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
  Pagination,
} from "@mui/material";
import { ShoppingBag, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { ordersAPI } from "../api/axios";
import type { Order, PaginatedOrders } from "../types";

// ─────────────────────────────────────────
// STATUS COLOR HELPER
// ─────────────────────────────────────────

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

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return "⏳";
    case "confirmed":
      return "✅";
    case "shipped":
      return "🚚";
    case "delivered":
      return "🎉";
    case "cancelled":
      return "❌";
    default:
      return "📦";
  }
};

const Orders: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const perPage = 10;

  // ─────────────────────────────────────────
  // FETCH ORDERS
  // ─────────────────────────────────────────

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await ordersAPI.getOrders(page, perPage);
      const data: PaginatedOrders = response.data;
      console.log("orders data: ", data);

      setOrders(data.orders);
      setTotal(data.total);
    } catch (err: any) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────

  if (!loading && orders.length === 0) {
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
        <ShoppingBag sx={{ fontSize: 100, color: "#ddd" }} />
        <Typography variant="h5" sx={{ color: "text.secondary" }}>
          No orders yet!
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          Start shopping to see your orders here
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/products")}
          sx={{ backgroundColor: "#ff3f6c" }}
        >
          Start Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* HEADER */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        My Orders
        {total > 0 && (
          <Typography
            component="span"
            variant="body1"
            sx={{ color: "text.secondary", ml: 2 }}
          >
            ({total} orders)
          </Typography>
        )}
      </Typography>

      {/* ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* LOADING */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 10,
          }}
        >
          <CircularProgress sx={{ color: "#ff3f6c" }} />
        </Box>
      ) : (
        <>
          {/* ORDERS LIST */}
          {orders.map((order: Order) => (
            <Card
              key={order.id}
              sx={{
                mb: 2,
                borderRadius: 2,
                cursor: "pointer",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 4 },
              }}
              onClick={() => navigate(`/orders/${order.id}`)}
            >
              <CardContent>
                {/* ORDER HEADER */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: "bold" }}>
                      Order #{order.id}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </Typography>
                  </Box>

                  <Chip
                    label={`${getStatusIcon(order.status)} ${order.status.toUpperCase()}`}
                    color={getStatusColor(order.status) as any}
                    sx={{ fontWeight: "bold" }}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* ORDER ITEMS PREVIEW */}
                <Box sx={{ mb: 2 }}>
                  {order.items.slice(0, 2).map((item) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <img
                        src={
                          item.product.image_url ||
                          `https://picsum.photos/seed/${item.product.id}/50/50`
                        }
                        alt={item.product.name}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          {item.product.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Qty: {item.quantity} × ₹
                          {item.price_at_purchase.toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  {/* show remaining items count */}
                  {order.items.length > 2 && (
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", ml: 1 }}
                    >
                      +{order.items.length - 2} more items
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* ORDER FOOTER */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "bold",
                      color: "#ff3f6c",
                    }}
                  >
                    Total: ₹{order.total_amount.toLocaleString()}
                  </Typography>

                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{ color: "#ff3f6c" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/orders/${order.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}

          {/* PAGINATION */}
          {total > perPage && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Pagination
                count={Math.ceil(total / perPage)}
                page={page}
                onChange={(_, value) => setPage(value)}
                sx={{
                  "& .Mui-selected": {
                    backgroundColor: "#ff3f6c !important",
                    color: "white",
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Orders;

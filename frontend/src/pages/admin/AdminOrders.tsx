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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Divider,
  Pagination,
} from "@mui/material";
import { adminAPI, ordersAPI } from "../../api/axios";
import type { Order, PaginatedOrders } from "../../types";

// ─────────────────────────────────────────
// STATUS HELPERS
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

const getNextStatus = (status: string) => {
  switch (status) {
    case "pending":
      return "confirmed";
    case "confirmed":
      return "shipped";
    case "shipped":
      return "delivered";
    default:
      return null;
  }
};

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const perPage = 10;

  // ─────────────────────────────────────────
  // FETCH ORDERS
  // ─────────────────────────────────────────

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminAPI.getAllOrders(
        page,
        statusFilter || undefined,
      );
      const data: PaginatedOrders = response.data;
      setOrders(data.orders);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // UPDATE ORDER STATUS
  // ─────────────────────────────────────────

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      setUpdatingId(orderId);
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      await fetchOrders();
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to update order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
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
          Manage Orders
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

        {/* STATUS FILTER */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Filter Status</InputLabel>
          <Select
            value={statusFilter}
            label="Filter Status"
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <MenuItem value="">All Orders</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="confirmed">Confirmed</MenuItem>
            <MenuItem value="shipped">Shipped</MenuItem>
            <MenuItem value="delivered">Delivered</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* ERROR */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
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
      ) : orders.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <Typography sx={{ color: "text.secondary" }}>
            No orders found
          </Typography>
        </Box>
      ) : (
        <>
          {/* ORDERS LIST */}
          {orders.map((order: Order) => (
            <Card key={order.id} sx={{ mb: 2, borderRadius: 2 }}>
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

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Chip
                      label={order.status.toUpperCase()}
                      color={getStatusColor(order.status) as any}
                      sx={{ fontWeight: "bold" }}
                    />

                    {/* UPDATE STATUS BUTTON */}
                    {getNextStatus(order.status) && (
                      <Button
                        variant="contained"
                        size="small"
                        disabled={updatingId === order.id}
                        onClick={() =>
                          handleStatusUpdate(
                            order.id,
                            getNextStatus(order.status)!,
                          )
                        }
                        sx={{
                          backgroundColor: "#ff3f6c",
                          "&:hover": {
                            backgroundColor: "#cc3357",
                          },
                        }}
                      >
                        {updatingId === order.id ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          `Mark as ${getNextStatus(order.status)}`
                        )}
                      </Button>
                    )}

                    {/* CANCEL BUTTON */}
                    {(order.status === "pending" ||
                      order.status === "confirmed") && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        disabled={updatingId === order.id}
                        onClick={() =>
                          handleStatusUpdate(order.id, "cancelled")
                        }
                      >
                        Cancel
                      </Button>
                    )}
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* ORDER ITEMS + DETAILS */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 8 }}>
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
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
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
                    {order.items.length > 2 && (
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        +{order.items.length - 2} more items
                      </Typography>
                    )}
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                      >
                        Total Amount
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "bold",
                          color: "#ff3f6c",
                        }}
                      >
                        ₹{order.total_amount.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mt: 1,
                        }}
                      >
                        {order.shipping_address}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
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

export default AdminOrders;

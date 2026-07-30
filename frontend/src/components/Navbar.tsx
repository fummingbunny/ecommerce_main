import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import {
  ShoppingCart,
  Person,
  Store,
  Dashboard,
  Logout,
  Receipt,
  Inventory,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  // for user dropdwon menu
  const [anchorE1, setAnchorE1] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorE1(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorE1(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar position="sticky" sx={{ backgroundColor: "#ff3f6c" }}>
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            cursor: "pointer",
            flexGrow: 0,
            mr: 4,
          }}
          onClick={() => navigate("/")}
        >
          ShopEasy
        </Typography>
        <Box sx={{ flexGrow: 1, display: "flex", gap: 2 }}>
          <Button
            color="inherit"
            startIcon={<Store />}
            onClick={() => navigate("/products")}
          >
            Products
          </Button>
          {isAdmin && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={() => navigate("/admin/dashboard")}
              >
                Dashboard
              </Button>
              <Button
                color="inherit"
                startIcon={<Receipt />}
                onClick={() => navigate("/admin/orders")}
              >
                Manage Orders
              </Button>
              <Button
                color="inherit"
                startIcon={<Inventory />}
                onClick={() => navigate("/admin/products")}
              >
                Manage Products
              </Button>
            </Box>
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isAuthenticated && (
            <IconButton color="inherit" onClick={() => navigate("/cart")}>
              <Badge badgeContent={cartCount} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
          )}

          {isAuthenticated ? (
            <>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: "white",
                    color: "ff3f6c",
                    fontsize: 14,
                    fontWeight: "bold",
                  }}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorE1}
                open={Boolean(anchorE1)}
                onClose={handleMenuClose}
              >
                <MenuItem disabled>
                  <Typography variant="body2">{user?.name}</Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/profile");
                  }}
                >
                  <Person sx={{ mr: 1 }} fontSize="small" />
                  Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    navigate("/orders");
                  }}
                >
                  <Store sx={{ mr: 1 }} fontSize="small" />
                  My Orders
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleLogout();
                  }}
                >
                  <Logout sx={{ mr: 1 }} fontSize="small" />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                color="inherit"
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{ borderColor: "white" }}
              >
                Login
              </Button>
              <Button
                color="inherit"
                variant="contained"
                onClick={() => navigate("/register")}
                sx={{ borderColor: "white", color: "#ff3f6c" }}
              >
                Register
              </Button>
            </Box>
          )}
        </Box>
        ̦
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

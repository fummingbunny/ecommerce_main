import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { ShoppingCart, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart, loading } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await addToCart(product.id, 1);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      {/* PRODUCT IMAGE */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="220"
          image={
            product.image_url ||
            `https://picsum.photos/seed/${product.id}/400/220`
          }
          alt={product.name}
          sx={{ cursor: "pointer", objectFit: "cover" }}
          onClick={() => navigate(`/products/${product.id}`)}
        />

        {/* OUT OF STOCK OVERLAY */}
        {product.stock === 0 && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "white",
                fontWeight: "bold",
              }}
            >
              Out of Stock
            </Typography>
          </Box>
        )}

        {/* CATEGORY CHIP */}
        <Chip
          label={product.category.name}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: "#ff3f6c",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.7rem",
          }}
        />
      </Box>

      {/* PRODUCT DETAILS */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* NAME */}
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            cursor: "pointer",
            "&:hover": { color: "#ff3f6c" },
            // show only 2 lines max
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
          onClick={() => navigate(`/products/${product.id}`)}
        >
          {product.name}
        </Typography>

        {/* DESCRIPTION */}
        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* PRICE */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 1,
            gap: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              color: "#ff3f6c",
            }}
          >
            ₹{product.price.toLocaleString()}
          </Typography>
        </Box>

        {/* STOCK STATUS */}
        <Typography
          variant="caption"
          color={
            product.stock > 10
              ? "success.main"
              : product.stock > 0
                ? "warning.main"
                : "error.main"
          }
        >
          {product.stock > 10
            ? "✓ In Stock"
            : product.stock > 0
              ? `⚠ Only ${product.stock} left!`
              : "✗ Out of Stock"}
        </Typography>
      </CardContent>

      {/* ACTION BUTTONS */}
      <CardActions sx={{ px: 2, pb: 2, gap: 1 }}>
        {/* VIEW DETAILS */}
        <Tooltip title="View Details">
          <IconButton
            size="small"
            onClick={() => navigate(`/products/${product.id}`)}
            sx={{
              border: "1px solid #ff3f6c",
              color: "#ff3f6c",
              "&:hover": {
                backgroundColor: "#ff3f6c",
                color: "white",
              },
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* ADD TO CART */}
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<ShoppingCart />}
          onClick={handleAddToCart}
          disabled={product.stock === 0 || loading}
          sx={{
            backgroundColor: "#ff3f6c",
            "&:hover": {
              backgroundColor: "#cc3357",
            },
            "&:disabled": {
              backgroundColor: "#ccc",
            },
            borderRadius: 2,
          }}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;

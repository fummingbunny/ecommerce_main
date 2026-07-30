import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  ShoppingCart,
  ArrowBack,
  LocalShipping,
  Security,
  Replay,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { productsAPI } from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import type { Product } from "../types";
import ProductCard from "../components/ProductCard";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, loading: cartLoading } = useCart();
  const { isAuthenticated } = useAuth();

  // state
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // ─────────────────────────────────────────
  // FETCH PRODUCT
  // ─────────────────────────────────────────

  useEffect(() => {
    if (id) fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await productsAPI.getProduct(parseInt(id!));
      setProduct(response.data);

      // fetch related products from same category
      const relatedResponse = await productsAPI.getProducts({
        category_id: response.data.category_id,
        per_page: 4,
      });

      // exclude current product from related
      const related = relatedResponse.data.products.filter(
        (p: Product) => p.id !== parseInt(id!),
      );
      setRelatedProducts(related);
    } catch (err) {
      setError("Product not found!");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // ADD TO CART
  // ─────────────────────────────────────────

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    await addToCart(product!.id, quantity);
    setAddedToCart(true);

    // reset after 2 seconds
    setTimeout(() => setAddedToCart(false), 2000);
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

  if (error || !product) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button
          onClick={() => navigate("/products")}
          startIcon={<ArrowBack />}
          sx={{ color: "#ff3f6c" }}
        >
          Back to Products
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* BREADCRUMBS */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/products")}
        >
          Products
        </Link>
        <Link
          underline="hover"
          color="inherit"
          sx={{ cursor: "pointer" }}
          onClick={() =>
            navigate(`/products?category_id=${product.category_id}`)
          }
        >
          {product.category.name}
        </Link>
        <Typography color="text.primary">{product.name}</Typography>
      </Breadcrumbs>

      {/* MAIN PRODUCT SECTION */}
      <Grid container spacing={4}>
        {/* LEFT — Product Image */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ position: "relative" }}>
            <img
              src={
                product.image_url ||
                `https://picsum.photos/seed/${product.id}/600/500`
              }
              alt={product.name}
              style={{
                width: "100%",
                borderRadius: 12,
                objectFit: "cover",
                maxHeight: 500,
              }}
            />

            {/* out of stock overlay */}
            {product.stock === 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ color: "white", fontWeight: "bold" }}
                >
                  Out of Stock
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* RIGHT — Product Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* CATEGORY CHIP */}
          <Chip
            label={product.category.name}
            sx={{
              backgroundColor: "#ff3f6c",
              color: "white",
              mb: 2,
              fontWeight: "bold",
            }}
          />

          {/* PRODUCT NAME */}
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
            {product.name}
          </Typography>

          {/* PRICE */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: "#ff3f6c",
              mb: 2,
            }}
          >
            ₹{product.price.toLocaleString()}
          </Typography>

          {/* STOCK STATUS */}
          <Typography
            variant="body1"
            sx={{ mb: 2, fontWeight: "bold" }}
            color={
              product.stock > 10
                ? "success.main"
                : product.stock > 0
                  ? "warning.main"
                  : "error.main"
            }
          >
            {product.stock > 10
              ? `✓ In Stock (${product.stock} available)`
              : product.stock > 0
                ? `⚠ Only ${product.stock} left!`
                : "✗ Out of Stock"}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          {/* DESCRIPTION */}
          {product.description && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.8 }}
            >
              {product.description}
            </Typography>
          )}

          {/* QUANTITY SELECTOR */}
          {product.stock > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Quantity:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #ddd",
                  borderRadius: 2,
                }}
              >
                <Button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  sx={{ minWidth: 40, color: "#ff3f6c" }}
                >
                  -
                </Button>
                <Typography sx={{ px: 2, fontWeight: "bold" }}>
                  {quantity}
                </Typography>
                <Button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  sx={{ minWidth: 40, color: "#ff3f6c" }}
                >
                  +
                </Button>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Max: {product.stock}
              </Typography>
            </Box>
          )}

          {/* ADD TO CART BUTTON */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || cartLoading}
            sx={{
              backgroundColor: addedToCart ? "success.main" : "#ff3f6c",
              "&:hover": { backgroundColor: "#cc3357" },
              borderRadius: 2,
              py: 1.5,
              mb: 2,
              fontSize: 16,
              fontWeight: "bold",
              transition: "background-color 0.3s",
            }}
          >
            {cartLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : addedToCart ? (
              "✓ Added to Cart!"
            ) : product.stock === 0 ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </Button>

          <Divider sx={{ mb: 3 }} />

          {/* FEATURES */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <LocalShipping sx={{ color: "#ff3f6c" }} />
              <Typography variant="body2">
                <b>Free Delivery</b> on orders above ₹499
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Replay sx={{ color: "#ff3f6c" }} />
              <Typography variant="body2">
                <b>Easy Returns</b> within 30 days
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Security sx={{ color: "#ff3f6c" }} />
              <Typography variant="body2">
                <b>Secure Payment</b> 100% safe transactions
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3 }}>
            Related Products
          </Typography>
          <Grid container spacing={3}>
            {relatedProducts.map((p) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={p.id}>
                <ProductCard product={p} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default ProductDetail;

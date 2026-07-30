import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Pagination,
} from "@mui/material";
import { Add, Edit, Delete, Search } from "@mui/icons-material";
import { adminAPI, productsAPI } from "../../api/axios";
import type { Product, Category, PaginatedProducts } from "../../types";

// ─────────────────────────────────────────
// EMPTY FORM STATE
// ─────────────────────────────────────────

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  image_url: "",
  category_id: "",
};

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const perPage = 10;

  // dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // ─────────────────────────────────────────
  // FETCH DATA
  // ─────────────────────────────────────────

  useEffect(() => {
    fetchProducts();
  }, [page]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllProducts(page);
      const data: PaginatedProducts = response.data;
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      console.error("Failed to load categories");
    }
  };

  // ─────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({
        search: search || undefined,
        page: 1,
        per_page: perPage,
      });
      const data: PaginatedProducts = response.data;
      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // DIALOG HANDLERS
  // ─────────────────────────────────────────

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      image_url: product.image_url || "",
      category_id: product.category_id.toString(),
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setFormData(emptyForm);
    setFormError("");
  };

  // ─────────────────────────────────────────
  // FORM SUBMIT — ADD OR EDIT
  // ─────────────────────────────────────────

  const handleSubmit = async () => {
    // validation
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category_id
    ) {
      setFormError("Please fill all required fields");
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");

      const payload = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        image_url: formData.image_url || null,
        category_id: parseInt(formData.category_id),
      };

      if (editingProduct) {
        // UPDATE
        await productsAPI.updateProduct(editingProduct.id, payload);
        setSuccess("Product updated successfully!");
      } else {
        // CREATE
        await productsAPI.createProduct(payload);
        setSuccess("Product created successfully!");
      }

      handleCloseDialog();
      fetchProducts();

      // clear success after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Failed to save product");
    } finally {
      setFormLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // DELETE PRODUCT
  // ─────────────────────────────────────────

  const handleDelete = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await productsAPI.deleteProduct(productId);
      setSuccess("Product deleted successfully!");
      fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete product");
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
          Manage Products
          {total > 0 && (
            <Typography
              component="span"
              variant="body1"
              sx={{ color: "text.secondary", ml: 2 }}
            >
              ({total} products)
            </Typography>
          )}
        </Typography>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAdd}
          sx={{
            backgroundColor: "#ff3f6c",
            "&:hover": { backgroundColor: "#cc3357" },
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* SEARCH */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          sx={{ maxWidth: 400 }}
        />
        <Button
          variant="contained"
          startIcon={<Search />}
          onClick={handleSearch}
          sx={{ backgroundColor: "#ff3f6c" }}
        >
          Search
        </Button>
      </Box>

      {/* SUCCESS */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

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
      ) : (
        <>
          {/* PRODUCTS GRID */}
          <Grid container spacing={2}>
            {products.map((product) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={product.id}>
                <Card sx={{ borderRadius: 2, height: "100%" }}>
                  <CardContent>
                    {/* PRODUCT IMAGE */}
                    <img
                      src={
                        product.image_url ||
                        `https://picsum.photos/seed/${product.id}/300/150`
                      }
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: 150,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    />

                    {/* PRODUCT INFO */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          flexGrow: 1,
                          mr: 1,
                        }}
                      >
                        {product.name}
                      </Typography>
                      <Chip
                        label={product.is_active ? "Active" : "Inactive"}
                        color={product.is_active ? "success" : "error"}
                        size="small"
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", mb: 1 }}
                    >
                      {product.category.name}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#ff3f6c",
                          fontWeight: "bold",
                        }}
                      >
                        ₹{product.price.toLocaleString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color:
                            product.stock === 0
                              ? "error.main"
                              : product.stock < 10
                                ? "warning.main"
                                : "success.main",
                        }}
                      >
                        Stock: {product.stock}
                      </Typography>
                    </Box>

                    {/* ACTION BUTTONS */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                      }}
                    >
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleOpenEdit(product)}
                        sx={{
                          borderColor: "#ff3f6c",
                          color: "#ff3f6c",
                        }}
                      >
                        Edit
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

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

      {/* ADD/EDIT DIALOG */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>
          {editingProduct ? "Edit Product" : "Add New Product"}
        </DialogTitle>

        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2, mt: 1 }}>
              {formError}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Product Name *"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            sx={{ mb: 2, mt: 1 }}
          />

          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({
                ...formData,
                description: e.target.value,
              })
            }
            sx={{ mb: 2 }}
          />

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Price *"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Stock *"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Category *</InputLabel>
            <Select
              value={formData.category_id}
              label="Category *"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category_id: e.target.value,
                })
              }
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Image URL"
            value={formData.image_url}
            onChange={(e) =>
              setFormData({
                ...formData,
                image_url: e.target.value,
              })
            }
            placeholder="https://example.com/image.jpg"
          />
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={formLoading}
            sx={{
              backgroundColor: "#ff3f6c",
              "&:hover": { backgroundColor: "#cc3357" },
            }}
          >
            {formLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : editingProduct ? (
              "Update"
            ) : (
              "Add Product"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProducts;

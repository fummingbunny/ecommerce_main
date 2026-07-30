import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Button,
  Pagination,
  CircularProgress,
  Drawer,
  IconButton,
  Divider,
  Chip,
} from "@mui/material";
import { Search, FilterList, Close } from "@mui/icons-material";
import { productsAPI } from "../api/axios";
import type { Product, Category, PaginatedProducts } from "../types";
import ProductCard from "../components/ProductCard";

const Products: React.FC = () => {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────

  // products data
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // categories
  const [categories, setCategories] = useState<Category[]>([]);

  // filters
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [page, setPage] = useState(1);
  const perPage = 12;

  // mobile filter drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ─────────────────────────────────────────
  // FETCH CATEGORIES
  // ─────────────────────────────────────────

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productsAPI.getCategories();
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
    fetchCategories();
  }, []);

  // ─────────────────────────────────────────
  // FETCH PRODUCTS
  // ─────────────────────────────────────────

  useEffect(() => {
    fetchProducts();
  }, [page, categoryId]);
  // ↑ refetch when page or category changes

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts({
        page,
        per_page: perPage,
        category_id: categoryId || undefined,
        min_price: priceRange[0],
        max_price: priceRange[1],
        search: search || undefined,
      });
      const data: PaginatedProducts = response.data;
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // SEARCH HANDLER
  // ─────────────────────────────────────────

  const handleSearch = () => {
    setPage(1); // reset to first page
    fetchProducts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // ─────────────────────────────────────────
  // CLEAR FILTERS
  // ─────────────────────────────────────────

  const handleClearFilters = () => {
    setSearch("");
    setCategoryId("");
    setPriceRange([0, 100000]);
    setPage(1);
  };

  // ─────────────────────────────────────────
  // FILTER PANEL (used in both sidebar and drawer)
  // ─────────────────────────────────────────

  const FilterPanel = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
        Filters
      </Typography>

      {/* CATEGORY FILTER */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={categoryId}
          label="Category"
          onChange={(e) => {
            setCategoryId(e.target.value as number | "");
            setPage(1);
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map((cat) => (
            <MenuItem key={cat.id} value={cat.id}>
              {cat.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* PRICE RANGE */}
      <Typography variant="subtitle2" gutterBottom>
        Price Range
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
        ₹{priceRange[0].toLocaleString()} — ₹{priceRange[1].toLocaleString()}
      </Typography>
      <Slider
        value={priceRange}
        onChange={(_, newValue) => setPriceRange(newValue as number[])}
        min={0}
        max={100000}
        step={500}
        sx={{ color: "#ff3f6c", mb: 3 }}
      />

      {/* APPLY + CLEAR BUTTONS */}
      <Button
        fullWidth
        variant="contained"
        onClick={() => {
          setPage(1);
          fetchProducts();
          setDrawerOpen(false);
        }}
        sx={{
          backgroundColor: "#ff3f6c",
          mb: 1,
        }}
      >
        Apply Filters
      </Button>

      <Button
        fullWidth
        variant="outlined"
        onClick={handleClearFilters}
        sx={{ borderColor: "#ff3f6c", color: "#ff3f6c" }}
      >
        Clear Filters
      </Button>
    </Box>
  );

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <Box sx={{ p: 3 }}>
      {/* PAGE HEADER */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
        Products
        {total > 0 && (
          <Typography
            component="span"
            sx={{ variant: "body1", color: "text.secondary", ml: 2 }}
          >
            ({total} items)
          </Typography>
        )}
      </Typography>

      {/* SEARCH BAR */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          alignItems: "center",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          slotProps={{
            input: {
              startAdornment: (
                <Search sx={{ mr: 1, color: "text.secondary" }} />
              ),
            },
          }}
          sx={{ maxWidth: 500 }}
        />

        <Button
          variant="contained"
          onClick={handleSearch}
          sx={{ backgroundColor: "#ff3f6c", px: 3 }}
        >
          Search
        </Button>

        {/* MOBILE FILTER BUTTON */}
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            display: { xs: "flex", md: "none" },
            border: "1px solid #ff3f6c",
            color: "#ff3f6c",
          }}
        >
          <FilterList />
        </IconButton>
      </Box>

      {/* ACTIVE FILTERS CHIPS */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {categoryId && (
          <Chip
            label={`Category: ${categories.find((c) => c.id === categoryId)?.name}`}
            onDelete={() => setCategoryId("")}
            sx={{ backgroundColor: "#ff3f6c", color: "white" }}
          />
        )}
        {search && (
          <Chip
            label={`Search: ${search}`}
            onDelete={() => setSearch("")}
            sx={{ backgroundColor: "#ff3f6c", color: "white" }}
          />
        )}
      </Box>

      {/* MAIN CONTENT */}
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* SIDEBAR FILTERS — desktop only */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            display: { xs: "none", md: "block" },
          }}
        >
          <Box
            sx={{
              border: "1px solid #eee",
              borderRadius: 2,
              position: "sticky",
              top: 80,
            }}
          >
            <FilterPanel />
          </Box>
        </Box>

        {/* PRODUCTS GRID */}
        <Box sx={{ flexGrow: 1 }}>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 10,
              }}
            >
              <CircularProgress sx={{ color: "#ff3f6c" }} size={50} />
            </Box>
          ) : products.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 10,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No products found
              </Typography>
              <Button
                onClick={handleClearFilters}
                sx={{ color: "#ff3f6c", mt: 2 }}
              >
                Clear filters
              </Button>
            </Box>
          ) : (
            <>
              {/* PRODUCT CARDS GRID */}
              <Grid container spacing={3}>
                {products.map((product) => (
                  <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={product.id}>
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {/* PAGINATION */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Pagination
                  count={Math.ceil(total / perPage)}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      color: "#ff3f6c",
                    },
                    "& .Mui-selected": {
                      backgroundColor: "#ff3f6c !important",
                      color: "white",
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* MOBILE FILTER DRAWER */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Filters
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider />
          <FilterPanel />
        </Box>
      </Drawer>
    </Box>
  );
};

export default Products;

# MYSTIC MATRIX REST API Documentation

Base URL: `http://localhost:5001/api`

---

## 1. System & Health

### `GET /health`
Returns the status of the API and active realm time.

**Response:**
```json
{
  "status": "online",
  "app": "MYSTIC MATRIX REST API",
  "shop": "Madam Hex's Potion & Ingredient Emporium",
  "realm": "Hallowmere Nocturnal Market",
  "timestamp": "2026-10-31T18:00:00.000Z"
}
```

---

## 2. Product Management

### `GET /products`
Retrieve all products with enriched real-time stock status and forecast metrics.

**Query Parameters:**
- `categoryId` (optional, integer): `1` for Ingredients, `2` for Potions.
- `search` (optional, string): Fuzzy name or description search.
- `status` (optional, string): Filter by `CRITICAL`, `LOW_STOCK`, `OVERSTOCKED`, or `HEALTHY`.

**Response (Sample):**
```json
{
  "success": true,
  "count": 22,
  "data": [
    {
      "id": 4,
      "name": "Fairy Wings",
      "category_id": 1,
      "category_name": "Magical Ingredients",
      "supplier_name": "Whispering Woods Foragers",
      "current_stock": 3,
      "min_stock_level": 25,
      "max_stock_level": 150,
      "unit_cost": 12.0,
      "selling_price": 28.0,
      "reorder_point": 84,
      "safety_stock": 15,
      "is_halloween_surge": 1,
      "stock_status": "CRITICAL",
      "predicted_30d_demand": 654,
      "days_until_stockout": 0.1,
      "suggested_reorder": 666
    }
  ]
}
```

### `GET /products/:id`
Retrieve a single product and its individual forecasting breakdown.

### `POST /products`
Catalog a new product in the apothecary.

**Body:**
```json
{
  "name": "Basilisk Venom",
  "category_id": 1,
  "supplier_id": 5,
  "description": "Potent paralytic distillation.",
  "current_stock": 15,
  "min_stock_level": 10,
  "max_stock_level": 50,
  "unit_cost": 30.0,
  "selling_price": 85.0,
  "is_halloween_surge": false
}
```

### `PUT /products/:id`
Update an existing product's pricing, stock thresholds, or supplier.

### `DELETE /products/:id`
Banish a product from the apothecary database.

### `POST /products/:id/adjust-stock`
Quickly increment or decrement shelf stock and create an audit log transaction.

**Body:**
```json
{
  "adjustment": 25,
  "type": "RESTOCK",
  "reason": "Replenishment shipment received"
}
```

---

## 3. Demand Forecasting & Intelligence

### `GET /forecasts`
Computes Holt-Winters Exponential Smoothing forecasts across all products.

**Query Parameters:**
- `halloweenMultiplier` (optional, float): Multiplier override (e.g. `1.0`, `1.5`, `2.0`, `2.5`).

**Response Properties per Product:**
- `metrics.mean_daily_demand`: Average daily sales rate.
- `metrics.std_dev_daily_demand`: Daily sales standard deviation ($\sigma$).
- `metrics.trend_factor`: Holt's trend slope ($T$).
- `metrics.seasonal_factor`: Calibrated Halloween multiplier ($S$).
- `predictions.predicted_7d_demand`: Projected 7-day sales.
- `predictions.predicted_30d_demand`: Projected 30-day sales.
- `predictions.suggested_reorder_qty`: Recommended replenishment.
- `predictions.reorder_point`: Safety threshold trigger ($ROP$).
- `predictions.days_until_stockout`: Days before inventory reaches 0.
- `projections_timeline`: Array of 30 future days with predicted value, lower 95% bound, and upper 95% bound.

### `GET /forecasts/:id`
Deep-dive forecast for a specific product.

---

## 4. Smart AI Recommendations

### `GET /recommendations`
Returns actionable recommendations prioritized by business urgency (`CRITICAL` $\to$ `HIGH` $\to$ `MEDIUM` $\to$ `INFO`).

**Query Parameters:**
- `halloweenMultiplier` (optional, float)

### `POST /recommendations/:productId/apply-restock`
Executes an immediate replenishment order based on the AI recommendation.

**Body:**
```json
{
  "quantity": 100,
  "reason": "Applied emergency Halloween restock recommendation"
}
```

---

## 5. Sales & Analytics

### `GET /sales`
Historical sales transactions with customer patron demographics.

### `POST /sales`
Record a new customer purchase at Madam Hex's counter. Decrements stock in real-time.

**Body:**
```json
{
  "product_id": 13,
  "quantity": 2,
  "customer_type": "Witch",
  "notes": "Midnight Sabbath charm potion"
}
```

### `GET /sales/transactions`
Audit trail of all stock movements (RESTOCK, SALE, WASTE, ADJUSTMENT).

### `GET /analytics/dashboard`
Returns aggregated executive dashboard KPIs, inventory values, health scores, and Halloween surge alerts.

### `GET /analytics/sales`
Returns 30-day daily sales timeline, top 8 bestsellers with net profit, and category performance.

### `POST /analytics/reset-demo`
Resets all database tables back to the canonical seed state for live hackathon judging.


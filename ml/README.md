# CortexPulse AI - Machine Learning & Analytics

This directory houses the machine learning models, feature engineering pipelines, and analytical clustering services for CortexPulse AI.

---

## 1. Personalized Product Recommendation Engine (`ml/src/models/recommender.py`)

### Algorithm Architecture:
The engine uses **Content-Based Vectorization** augmented with **Dynamic Interaction Weighting**:

1. **Content Feature Extraction**:
   - Each product's attributes (`title`, `brand`, `category_name`, `description`, `tags`, and binned `price_range` tier) are tokenized and vectorized into an $N$-dimensional space using **scikit-learn's `TfidfVectorizer`** with uni-gram and bi-gram representations.
   - Price tiers are discretized into `budget (<$100)`, `mid ($100-$250)`, `upper ($250-$500)`, and `premium (>$500)`.

2. **Customer Affinity Profile Synthesis**:
   - User actions are weighted by implicit intent signal:
     - `purchase`: **5.0** (Strongest purchase commitment)
     - `add_to_cart`: **3.5** (High intent to purchase)
     - `wishlist`: **2.5** (Explicit interest)
     - `product_view`: **1.0** (Browsing attention)
     - `product_click`: **0.5** (Initial exploratory click)
   - A normalized weighted sum of product TF-IDF vectors forms the customer's real-time preference vector $\vec{u}$.

3. **Similarity Scoring & Hybrid Category Boost**:
   - Cosine similarity between $\vec{u}$ and all candidate product vectors is computed:
     $$\text{sim}(u, p) = \frac{\vec{u} \cdot \vec{p}}{\|\vec{u}\| \|\vec{p}\|}$$
   - An affinity multiplier (+15%) is applied to items in categories the user has repeatedly engaged with.
   - Already purchased items can be excluded or de-prioritized to maximize discovery.

4. **Cold-Start & Insufficient Data Fallback**:
   - When a visitor has zero or sparse interaction data ($< 1$ interaction), the engine smoothly falls back to trending catalog products ranked by verified customer ratings, review volume, and sales activity. Zero fake recommendations.

---

## 2. AI Customer Behavioral Segmentation (`ml/src/models/segmentation.py`)

### Algorithm Architecture:
Customer segmentation is performed via **Unsupervised K-Means Clustering (`sklearn.cluster.KMeans`)** on real RFM (Recency, Frequency, Monetary) and behavioral data:

1. **Engineered Features**:
   - `total_spending`: Gross customer spend ($) across completed orders.
   - `purchase_frequency`: Number of placed orders.
   - `average_order_value`: Average spend per order.
   - `product_views`: Cumulative product detail page views.
   - `cart_additions`: Number of items added to cart.
   - `recency_days`: Days elapsed since most recent activity.

2. **Standardization**:
   - All features are normalized using **`StandardScaler`** to have zero mean and unit variance ($\mu = 0, \sigma = 1$).

3. **Centroid-Derived Customer Segments**:
   - Centroids are inverse-transformed back to the original feature space and ranked to determine natural behavioral clusters:
     - **High Value**: Top gross spending and highest Average Order Value.
     - **Frequent Buyer**: Highest order count and frequent purchase cycles.
     - **Occasional Buyer**: Moderate spending spaced out across promotion cycles.
     - **New Customer**: Emerging buyers or high browsing activity with recent recency.
     - **Low Engagement**: Minimal interaction and low conversion likelihood.
   - Segments are dynamically learned from data rather than arbitrary hardcoded if-else statements.

---

## Setup & Running
```bash
# Navigate to ml folder
cd ml

# Dependencies:
pip install -r requirements.txt
```


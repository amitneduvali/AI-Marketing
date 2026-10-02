"""
Personalized Product Recommendation Engine
CortexPulse AI - Machine Learning Engine

Architecture & How it Works:
1. Content-Based Feature Representation:
   - For every product in the active catalog, a dense metadata corpus is constructed from:
     * Category Name (e.g., "Audio & Acoustics")
     * Brand / Manufacturer (e.g., "NeuralFlow Acoustics")
     * Description text
     * Price range bracket (Budget <$100, Mid $100-$250, Upper $250-$500, Premium >$500)
     * Product Tags & Attributes
   - A TF-IDF (Term Frequency-Inverse Document Frequency) vectorizer maps each product
     into an n-dimensional metric space.
   - Cosine similarity is computed across all item vectors.

2. User Profile Synthesis:
   - User interaction events are aggregated with dynamic importance weights:
     * Purchase: weight 5.0 (strongest signal of intent)
     * Add to Cart: weight 3.5 (high purchase intention)
     * Wishlist: weight 2.5 (positive interest)
     * Product View: weight 1.0 (exploratory interest)
     * Product Click: weight 0.5 (initial attention)
   - A weighted composite user profile is projected into the TF-IDF space.

3. Candidate Scoring & Hybrid Priority:
   - Each catalog product is scored by its cosine similarity to the user's composite profile.
   - Category affinity boost: products in categories the user has repeatedly interacted with
     receive an affinity multiplier.
   - Cold Start / Insufficient Data Fallback:
     When interaction history is sparse (< 1 interaction), the engine smoothly falls back to
     trending / highest-rated products verified from database records.
"""

from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import defaultdict


INTERACTION_WEIGHTS = {
    "purchase": 5.0,
    "add_to_cart": 3.5,
    "wishlist": 2.5,
    "product_view": 1.0,
    "product_click": 0.5,
    "category_view": 0.8,
}


def compute_price_tier(price: float) -> str:
    """Classify product into price brackets for content filtering."""
    if price < 100:
        return "tier_budget_under_100"
    elif price < 250:
        return "tier_mid_100_to_250"
    elif price < 500:
        return "tier_upper_250_to_500"
    else:
        return "tier_premium_above_500"


class ContentBasedRecommender:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words="english",
            max_features=2500,
            ngram_range=(1, 2),
        )
        self.products: List[Dict[str, Any]] = []
        self.product_id_to_idx: Dict[str, int] = {}
        self.idx_to_product_id: Dict[int, str] = {}
        self.tfidf_matrix = None
        self.is_fitted = False

    def _build_content_string(self, product: Dict[str, Any]) -> str:
        """Combine product attributes into a rich text corpus for vectorization."""
        title = product.get("title", "")
        brand = product.get("brand", "")
        category = product.get("category_name", "")
        description = product.get("description", "")
        tags = " ".join(product.get("tags", []))
        price = float(product.get("price", 0.0))
        price_tier = compute_price_tier(price)

        # Attribute key-values
        attrs = " ".join(f"{k} {v}" for k, v in product.get("attributes", {}).items())

        # Give higher weight to category, brand, and title by repeating them
        content = f"{title} {title} {brand} {brand} {category} {category} {tags} {price_tier} {description} {attrs}"
        return content

    def fit(self, products: List[Dict[str, Any]]) -> "ContentBasedRecommender":
        """Fit TF-IDF matrix over all active catalog products."""
        self.products = products
        self.product_id_to_idx = {p["id"]: i for i, p in enumerate(products)}
        self.idx_to_product_id = {i: p["id"] for i, p in enumerate(products)}

        if not products:
            self.is_fitted = False
            return self

        corpus = [self._build_content_string(p) for p in products]
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus)
        self.is_fitted = True
        return self

    def _get_fallback_recommendations(
        self,
        top_n: int = 8,
        exclude_ids: Optional[set] = None,
    ) -> List[Dict[str, Any]]:
        """
        Fallback strategy for cold-start users with insufficient interaction history:
        Returns trending / popular catalog products ranked by rating and review count.
        Zero fabricated products.
        """
        exclude_ids = exclude_ids or set()
        candidates = [p for p in self.products if p["id"] not in exclude_ids]

        # Sort by rating and review volume
        candidates.sort(
            key=lambda x: (
                float(x.get("avg_rating", 0.0)),
                int(x.get("review_count", 0)),
                float(x.get("price", 0.0)),
            ),
            reverse=True,
        )

        results = []
        for p in candidates[:top_n]:
            results.append({
                "product_id": p["id"],
                "score": 0.85,
                "reason": "Popular & Highly Rated in Catalog",
                "match_type": "trending_fallback",
            })
        return results

    def recommend(
        self,
        user_interactions: List[Dict[str, Any]],
        user_purchases: Optional[List[Dict[str, Any]]] = None,
        top_n: int = 8,
        exclude_purchased: bool = False,
    ) -> List[Dict[str, Any]]:
        """
        Generate personalized product recommendations by combining content attributes
        with customer interaction history.
        """
        if not self.is_fitted or not self.products:
            return []

        purchased_ids = set()
        if user_purchases:
            for p in user_purchases:
                if p.get("product_id"):
                    purchased_ids.add(p["product_id"])

        # Aggregate weighted interactions per product and category
        product_weights = defaultdict(float)
        category_weights = defaultdict(float)
        interacted_product_titles = {}

        for it in user_interactions:
            itype = it.get("interaction_type", "product_view")
            pid = it.get("product_id")
            cid = it.get("category_id")
            w = INTERACTION_WEIGHTS.get(itype, 1.0)

            if pid and pid in self.product_id_to_idx:
                product_weights[pid] += w
                idx = self.product_id_to_idx[pid]
                interacted_product_titles[pid] = self.products[idx].get("title", "")

            if cid:
                category_weights[cid] += w

        # Also add previous purchases to weights if passed
        if user_purchases:
            for p in user_purchases:
                pid = p.get("product_id")
                if pid and pid in self.product_id_to_idx:
                    product_weights[pid] += INTERACTION_WEIGHTS["purchase"]

        # COLD START CHECK: If user has 0 valid product interactions, trigger trending fallback
        if not product_weights:
            return self._get_fallback_recommendations(
                top_n=top_n,
                exclude_ids=purchased_ids if exclude_purchased else set(),
            )

        # Build composite user profile vector in TF-IDF space
        total_weight = sum(product_weights.values())
        user_profile_vec = np.zeros((1, self.tfidf_matrix.shape[1]))

        for pid, weight in product_weights.items():
            idx = self.product_id_to_idx[pid]
            prod_vec = self.tfidf_matrix[idx].toarray()
            user_profile_vec += (weight / total_weight) * prod_vec

        # Compute cosine similarities between user profile and all products
        sim_scores = cosine_similarity(user_profile_vec, self.tfidf_matrix).flatten()

        # Find most strongly interacted product and category for explainability
        top_interacted_pid = max(product_weights.keys(), key=lambda k: product_weights[k])
        top_interacted_title = interacted_product_titles.get(top_interacted_pid, "your viewed items")

        # Rank candidates
        ranked_indices = np.argsort(sim_scores)[::-1]
        results: List[Dict[str, Any]] = []

        exclude_set = purchased_ids if exclude_purchased else set()

        for idx in ranked_indices:
            pid = self.idx_to_product_id[idx]
            if pid in exclude_set:
                continue

            product = self.products[idx]
            base_score = float(sim_scores[idx])

            # Apply category affinity bonus if matching user's top categories
            p_cat = product.get("category_id")
            cat_bonus = 1.0
            if p_cat and p_cat in category_weights:
                cat_bonus = 1.15  # 15% category alignment boost

            final_score = min(1.0, round(base_score * cat_bonus, 4))

            # Don't recommend the exact same item user already has heavily interacted with as #1
            # unless catalogue is very small, prefer similar unpurchased items
            if pid == top_interacted_pid and len(self.products) > top_n:
                continue

            # Determine explainable reason
            if p_cat and p_cat in category_weights:
                cat_name = product.get("category_name", "this vertical")
                reason = f"Based on your interest in {cat_name}"
            else:
                reason = f"Matches features similar to {top_interacted_title[:25]}..."

            results.append({
                "product_id": pid,
                "score": final_score,
                "reason": reason,
                "match_type": "personalized_content",
            })

            if len(results) >= top_n:
                break

        # If we got fewer than top_n recommendations (e.g. sparse catalog), fill with fallback
        if len(results) < top_n:
            seen_ids = {r["product_id"] for r in results} | exclude_set
            fallback_items = self._get_fallback_recommendations(
                top_n=top_n - len(results),
                exclude_ids=seen_ids,
            )
            results.extend(fallback_items)

        return results

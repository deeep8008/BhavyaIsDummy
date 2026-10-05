from typing import List, Optional
import numpy as np
from app.schemas.forecast_schemas import ForecastDataPoint, BusinessInsights

class InsightsEngine:
    """
    Computes business decision support metrics strictly derived from the future forecast
    and its uncertainty bounds.
    """

    @staticmethod
    def calculate_insights(
        forecast_points: List[ForecastDataPoint],
        current_inventory: Optional[float] = None
    ) -> BusinessInsights:
        if not forecast_points:
            raise ValueError("Cannot calculate insights from empty forecast points.")

        predictions = np.array([p.prediction for p in forecast_points], dtype=float)
        timestamps = [p.timestamp for p in forecast_points]
        upper_95_vals = np.array([p.upper_95 for p in forecast_points], dtype=float)
        horizon = len(predictions)

        # 1. Volume & Averages
        total_vol = round(float(np.sum(predictions)), 2)
        avg_demand = round(float(np.mean(predictions)), 2)

        # 2. Peak Demand
        peak_idx = int(np.argmax(predictions))
        peak_date = timestamps[peak_idx]
        peak_val = round(float(predictions[peak_idx]), 2)

        # 3. Minimum Demand
        min_idx = int(np.argmin(predictions))
        min_date = timestamps[min_idx]
        min_val = round(float(predictions[min_idx]), 2)

        # 4. Demand Trend (First Half vs Second Half)
        mid = max(1, horizon // 2)
        first_half_avg = float(np.mean(predictions[:mid]))
        second_half_avg = float(np.mean(predictions[mid:]))
        pct_change = ((second_half_avg - first_half_avg) / first_half_avg) if first_half_avg > 0 else 0.0

        if pct_change > 0.03:
            trend = "increasing"
        elif pct_change < -0.03:
            trend = "decreasing"
        else:
            trend = "relatively stable"

        # 5. Safety Stock Recommendation based on 95% uncertainty buffer
        # Lead time factor sqrt(L), where L is min(horizon, 14 days lead time)
        uncertainty_deltas = np.maximum(0.0, upper_95_vals - predictions)
        mean_daily_uncertainty = float(np.mean(uncertainty_deltas))
        lead_time_days = min(horizon, 14)
        safety_stock_val = round(mean_daily_uncertainty * np.sqrt(lead_time_days), 1)
        safety_stock_method = (
            f"Derived from average daily 95% confidence buffer ({mean_daily_uncertainty:.1f} units/day) "
            f"scaled over a standard {lead_time_days}-day replenishment lead time (sqrt(L) scaling)."
        )

        # 6. Stockout Risk Handling
        if current_inventory is None:
            stockout_status = "unavailable"
            stockout_msg = "Current on-hand inventory not provided. Cannot compute stockout risk without inventory data."
            stockout_date = None
        else:
            cum_demand = np.cumsum(predictions)
            stockout_indices = np.where(cum_demand > current_inventory)[0]

            if len(stockout_indices) > 0:
                first_stockout_idx = stockout_indices[0]
                stockout_date = timestamps[first_stockout_idx]
                stockout_status = "high_risk"
                stockout_msg = (
                    f"Projected demand ({total_vol} units) exceeds on-hand inventory ({current_inventory} units). "
                    f"Stockout is estimated to occur on {stockout_date}."
                )
            elif current_inventory < total_vol * 1.25:
                stockout_status = "moderate_risk"
                stockout_msg = (
                    f"On-hand inventory ({current_inventory} units) covers projected demand ({total_vol} units), "
                    f"but buffer is tight (< 25% safety margin)."
                )
                stockout_date = None
            else:
                stockout_status = "low_risk"
                stockout_msg = (
                    f"On-hand inventory ({current_inventory} units) is sufficient for projected demand ({total_vol} units) "
                    f"with a healthy safety margin."
                )
                stockout_date = None

        return BusinessInsights(
            total_projected_volume=total_vol,
            average_daily_demand=avg_demand,
            peak_demand_date=peak_date,
            peak_demand_value=peak_val,
            min_demand_date=min_date,
            min_demand_value=min_val,
            demand_trend=trend,
            recommended_safety_stock=safety_stock_val,
            safety_stock_method=safety_stock_method,
            stockout_risk_status=stockout_status,
            stockout_risk_message=stockout_msg,
            estimated_stockout_date=stockout_date
        )

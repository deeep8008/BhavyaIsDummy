import numpy as np
from typing import Union, List

class Metrics:
    """
    Pure mathematical evaluation metrics for time-series forecasting.
    Includes zero-division safety rules.
    """

    @staticmethod
    def rmse(y_true: Union[np.ndarray, List[float]], y_pred: Union[np.ndarray, List[float]]) -> float:
        """
        Root Mean Squared Error: sqrt( 1/N * sum((y_true - y_pred)^2) )
        Expressed in original target units.
        """
        y_t = np.asarray(y_true, dtype=float)
        y_p = np.asarray(y_pred, dtype=float)

        if len(y_t) == 0:
            return 0.0

        mse = np.mean((y_t - y_p) ** 2)
        return round(float(np.sqrt(mse)), 4)

    @staticmethod
    def mae(y_true: Union[np.ndarray, List[float]], y_pred: Union[np.ndarray, List[float]]) -> float:
        """
        Mean Absolute Error: 1/N * sum(|y_true - y_pred|)
        """
        y_t = np.asarray(y_true, dtype=float)
        y_p = np.asarray(y_pred, dtype=float)

        if len(y_t) == 0:
            return 0.0

        return round(float(np.mean(np.abs(y_t - y_p))), 4)

    @staticmethod
    def mape(
        y_true: Union[np.ndarray, List[float]],
        y_pred: Union[np.ndarray, List[float]],
        epsilon: float = 1e-8
    ) -> float:
        """
        Mean Absolute Percentage Error (MAPE).
        
        SAFE ZERO-TARGET STRATEGY:
        When actual target values contain 0 (e.g. 0 sales on a quiet day):
        1. Divisor |y_true| = 0 causes division-by-zero (Inf/NaN).
        2. Strategy: Standard masked evaluation over all non-zero actuals (y_true != 0).
        3. If all actuals in the test set are zero:
           - If predictions are also 0 -> MAPE = 0.0%
           - If predictions > 0 -> Uses small denominator epsilon to report relative percentage deviation.
        4. Returns error as a percentage value (e.g. 12.45 for 12.45%).
        """
        y_t = np.asarray(y_true, dtype=float)
        y_p = np.asarray(y_pred, dtype=float)

        if len(y_t) == 0:
            return 0.0

        # Mask non-zero actual observations
        non_zero_mask = y_t != 0

        if np.any(non_zero_mask):
            # Compute standard MAPE across non-zero points
            pct_errors = np.abs((y_t[non_zero_mask] - y_p[non_zero_mask]) / y_t[non_zero_mask])
            mape_value = float(np.mean(pct_errors) * 100.0)
        else:
            # All actuals are exactly 0
            if np.all(y_p == 0):
                mape_value = 0.0
            else:
                pct_errors = np.abs((y_t - y_p) / np.maximum(np.abs(y_t), epsilon))
                mape_value = float(np.mean(pct_errors) * 100.0)

        # Cap extreme outlier percentage for robustness
        return round(min(9999.0, mape_value), 4)

    @staticmethod
    def wape(y_true: Union[np.ndarray, List[float]], y_pred: Union[np.ndarray, List[float]]) -> float:
        """
        Weighted Absolute Percentage Error: sum(|y_true - y_pred|) / sum(|y_true|) * 100%
        """
        y_t = np.asarray(y_true, dtype=float)
        y_p = np.asarray(y_pred, dtype=float)

        sum_actual = np.sum(np.abs(y_t))
        if sum_actual == 0:
            return 0.0 if np.sum(np.abs(y_p)) == 0 else 100.0

        return round(float((np.sum(np.abs(y_t - y_p)) / sum_actual) * 100.0), 4)

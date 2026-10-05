from typing import List, Dict, Any
from app.evaluation.engine import ModelEvaluationResult

class LeaderboardGenerator:
    """
    Ranks evaluated models based on standard error metrics.
    
    RANKING RULE:
    1. Primary Sort: MAPE ascending (lower percentage error is better).
    2. Tie-Breaker: RMSE ascending (lower original units error is better).
    """

    @staticmethod
    def generate_leaderboard(eval_results: List[ModelEvaluationResult]) -> List[Dict[str, Any]]:
        if not eval_results:
            return []

        # Sort strictly by MAPE ascending, then RMSE ascending
        sorted_results = sorted(
            eval_results,
            key=lambda x: (x.mape, x.rmse, x.train_time_seconds)
        )

        leaderboard = []
        for rank_idx, res in enumerate(sorted_results, start=1):
            is_top = (rank_idx == 1)
            leaderboard.append({
                "rank": rank_idx,
                "model_name": res.model_name,
                "model_key": res.model_key,
                "model_type": res.model_type,
                "mape": res.mape,
                "rmse": res.rmse,
                "mae": res.mae,
                "wape": res.wape,
                "train_time_seconds": res.train_time_seconds,
                "status": "recommended" if is_top else "evaluated"
            })

        return leaderboard

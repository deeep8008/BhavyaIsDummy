class ForecastIQException(Exception):
    """Base exception class for all ForecastIQ application errors."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code

class NoCsvFoundError(ForecastIQException):
    """Raised when an uploaded folder or archive contains no .csv files."""
    def __init__(self, message: str = "No valid CSV files were found in the uploaded selection. Please upload a folder containing at least one .csv file."):
        super().__init__(message, status_code=400)

class DatasetNotFoundError(ForecastIQException):
    """Raised when the requested dataset ID does not exist."""
    def __init__(self, dataset_id: str):
        super().__init__(f"Dataset with ID '{dataset_id}' was not found in storage.", status_code=404)

class InvalidSchemaError(ForecastIQException):
    """Raised when user column mapping fails or required time-series columns are invalid."""
    def __init__(self, message: str):
        super().__init__(message, status_code=422)

class PreprocessingError(ForecastIQException):
    """Raised when data cleaning, frequency regularization, or missing value imputation fails."""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)

class SplitError(ForecastIQException):
    """Raised when chronological train/test split cannot be performed (e.g. invalid percentage or insufficient data points)."""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)

"""
Data import router for CSV dataset uploads and processing.
Handles the N-SUMHSS mental health services survey data import.
"""

from fastapi import APIRouter, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
import pandas as pd
import io
import logging
from typing import Dict, Any
from ...core.auth import get_current_admin_user
from ...database.base import SessionLocal
from ...database.seeds.generate_seed_data import SeedDataGenerator

router = APIRouter(prefix="/api/data-import", tags=["data-import"])
logger = logging.getLogger(__name__)


@router.post("/csv-upload")
async def upload_csv_dataset(file: UploadFile = File(...)):
    """Upload and process a CSV dataset file."""
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        # Read the uploaded file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Basic dataset info
        dataset_info = {
            "filename": file.filename,
            "shape": df.shape,
            "columns": df.columns.tolist(),
            "sample_data": df.head(5).to_dict('records'),
            "data_types": df.dtypes.astype(str).to_dict()
        }
        
        logger.info(f"Uploaded CSV dataset: {file.filename} with shape {df.shape}")
        
        return JSONResponse(content={
            "message": "CSV dataset uploaded successfully",
            "dataset_info": dataset_info
        })
        
    except Exception as e:
        logger.error(f"CSV upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process CSV: {str(e)}")


@router.get("/nsumhss-dataset")
async def load_nsumhss_dataset():
    """Load the N-SUMHSS dataset from local files."""
    
    try:
        generator = SeedDataGenerator()
        
        # Path to the dataset
        zip_path = "data-science/data/N-SUMHSS-2023-DS0001-bndl-data-csv_v1.zip"
        extract_to = "data-science/data/extracted"
        
        # Extract and load dataset
        csv_path = generator.extract_zip_dataset(zip_path, extract_to)
        df = generator.import_csv_dataset(csv_path)
        
        # Return dataset summary
        return JSONResponse(content={
            "message": "N-SUMHSS dataset loaded successfully",
            "dataset_info": {
                "name": "National Survey on Mental Health Service Systems 2023",
                "shape": df.shape,
                "total_records": len(df),
                "total_variables": len(df.columns),
                "sample_columns": df.columns.tolist()[:20]
            }
        })
        
    except Exception as e:
        logger.error(f"N-SUMHSS dataset loading failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to load dataset: {str(e)}")


@router.get("/dataset-analysis/{column_name}")
async def analyze_dataset_column(column_name: str):
    """Analyze a specific column from the loaded dataset."""
    
    try:
        # Load dataset
        csv_path = "data-science/data/extracted/NSUMHSS_2023_PUF_CSV.csv"
        df = pd.read_csv(csv_path)
        
        if column_name not in df.columns:
            raise HTTPException(status_code=404, detail=f"Column '{column_name}' not found")
        
        column_data = df[column_name]
        
        # Basic statistics
        analysis = {
            "column_name": column_name,
            "data_type": str(column_data.dtype),
            "non_null_count": int(column_data.count()),
            "null_count": int(column_data.isnull().sum()),
            "unique_values": int(column_data.nunique())
        }
        
        # Add specific statistics based on data type
        if pd.api.types.is_numeric_dtype(column_data):
            analysis.update({
                "mean": float(column_data.mean()) if not column_data.empty else None,
                "median": float(column_data.median()) if not column_data.empty else None,
                "std": float(column_data.std()) if not column_data.empty else None,
                "min": float(column_data.min()) if not column_data.empty else None,
                "max": float(column_data.max()) if not column_data.empty else None
            })
        else:
            # For categorical data
            value_counts = column_data.value_counts().head(10)
            analysis["top_values"] = value_counts.to_dict()
        
        return JSONResponse(content=analysis)
        
    except Exception as e:
        logger.error(f"Column analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/dataset-summary")
async def get_dataset_summary():
    """Get a comprehensive summary of the N-SUMHSS dataset."""
    
    try:
        csv_path = "data-science/data/extracted/NSUMHSS_2023_PUF_CSV.csv"
        df = pd.read_csv(csv_path)
        
        # Generate comprehensive summary
        summary = {
            "dataset_name": "National Survey on Mental Health Service Systems 2023",
            "description": "Comprehensive survey of mental health service facilities and programs",
            "total_records": len(df),
            "total_variables": len(df.columns),
            "data_quality": {
                "complete_records": int((~df.isnull().any(axis=1)).sum()),
                "records_with_missing": int(df.isnull().any(axis=1).sum()),
                "total_missing_values": int(df.isnull().sum().sum())
            },
            "key_variables": {
                "facility_id": "MPRID" if "MPRID" in df.columns else None,
                "state": "LOCATIONSTATE" if "LOCATIONSTATE" in df.columns else None,
                "insurance": "INSU" if "INSU" in df.columns else None,
                "mental_health": "INMH" if "INMH" in df.columns else None
            },
            "sample_columns": df.columns.tolist()[:30]
        }
        
        return JSONResponse(content=summary)
        
    except Exception as e:
        logger.error(f"Dataset summary failed: {e}")
        raise HTTPException(status_code=500, detail=f"Summary failed: {str(e)}")
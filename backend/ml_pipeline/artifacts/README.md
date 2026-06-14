# This directory stores trained ML model artifacts:
# - xgb_model.pkl      : Trained XGBoost classifier
# - scaler.pkl         : StandardScaler for numeric features
# - encoders.pkl       : LabelEncoders for categorical features
# - meta.json          : Model metadata and feature names
# - shap_summary.png   : SHAP summary plot
# - feature_importance.png : XGBoost feature importance
# - confusion_matrix.png   : Confusion matrix

# Run: python ml_pipeline/train.py <path-to-student-mat.csv>
# to populate this directory.

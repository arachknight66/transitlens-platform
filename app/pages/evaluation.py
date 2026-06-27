"""Evaluation Dashboard page presenting E2E performance metrics, confusion matrix, and injection-recovery results."""
import streamlit as st
import json
import os
import pandas as pd
from PIL import Image

def render():
    st.markdown("## 📈 Evaluation Dashboard")
    st.markdown("Quantified pipeline performance metrics calculated on validation splits, blind test splits, and injection-recovery trials.")

    # Paths to metrics
    ml_core_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    metrics_path = os.path.join(ml_core_path, "transitlens-ml-core", "eval", "results", "metrics.json")
    confusion_path = os.path.join(ml_core_path, "transitlens-ml-core", "eval", "results", "confusion_matrix.png")
    injection_path = os.path.join(ml_core_path, "transitlens-ml-core", "eval", "results", "injection_recovery_summary.csv")

    metrics_data = None
    if os.path.exists(metrics_path):
        try:
            with open(metrics_path, "r") as f:
                metrics_data = json.load(f)
        except Exception:
            pass

    if not metrics_data:
        st.info("Evaluation metrics file not found. Run the official evaluation profile in the CLI to generate results.")
        return

    # Tabs for different metrics categories
    tab_class, tab_param, tab_injection = st.tabs([
        "🤖 Classification & Accuracy", "📐 Parameter Recovery Rates", "💉 Injection-Recovery Results"
    ])

    with tab_class:
        st.markdown("### Classification Accuracy")
        
        # Display split summaries
        cols = st.columns(2)
        with cols[0]:
            val_acc = metrics_data.get("val_metrics", {}).get("accuracy", 0.0)
            st.metric("Validation Split Accuracy", f"{val_acc * 100:.1f}%", help="Calculated on disjoint validation target list")
        with cols[1]:
            test_acc = metrics_data.get("test_metrics", {}).get("accuracy", 0.0)
            st.metric("Blind Test Split Accuracy", f"{test_acc * 100:.1f}%", help="Calculated on blind test split targets")

        st.write("")
        
        # Confusion matrix display
        col_mat, col_report = st.columns([1, 1])
        with col_mat:
            st.markdown("#### Confusion Matrix")
            if os.path.exists(confusion_path):
                try:
                    img = Image.open(confusion_path)
                    st.image(img, use_container_width=True)
                except Exception as e:
                    st.error(f"Failed to display confusion matrix image: {e}")
            else:
                st.info("Confusion matrix image plot not generated yet.")

        with col_report:
            st.markdown("#### Per-Class Classification Report (Test Split)")
            test_classes = metrics_data.get("test_metrics", {}).get("per_class", {})
            if test_classes:
                records = []
                for name, info in test_classes.items():
                    records.append({
                        "Class": name.replace("_", " ").capitalize(),
                        "Precision": f"{info.get('precision', 0.0) * 100:.1f}%",
                        "Recall": f"{info.get('recall', 0.0) * 100:.1f}%",
                        "F1-Score": f"{info.get('f1', 0.0) * 100:.1f}%",
                        "Support": info.get("support", 0),
                    })
                st.dataframe(pd.DataFrame(records), use_container_width=True, hide_index=True)
            else:
                st.info("Per-class metrics not available.")

    with tab_param:
        st.markdown("### Parameter Recovery Performance")
        st.markdown("Measures how accurately the Box Least Squares (BLS) and analytical transit fit recovered physical parameters.")

        overall_recovery = metrics_data.get("overall_period_recovery_pct", 0.0)
        st.metric("Overall Period Recovery Rate (within 1% error)", f"{overall_recovery:.1f}%")

        col_errors1, col_errors2 = st.columns(2)
        with col_errors1:
            st.markdown("#### Validation Split Mean Absolute Error")
            val_p = metrics_data.get("val_metrics", {}).get("mean_period_error_pct", 0.0)
            val_d = metrics_data.get("val_metrics", {}).get("mean_depth_error_pct", 0.0)
            val_dur = metrics_data.get("val_metrics", {}).get("mean_duration_error_pct", 0.0)
            
            st.markdown(f"- **Period Error**: {val_p:.4f}%")
            st.markdown(f"- **Depth Error**: {val_d:.2f}%")
            st.markdown(f"- **Duration Error**: {val_dur:.2f}%")

        with col_errors2:
            st.markdown("#### Blind Test Split Mean Absolute Error")
            test_p = metrics_data.get("test_metrics", {}).get("mean_period_error_pct", 0.0)
            test_d = metrics_data.get("test_metrics", {}).get("mean_depth_error_pct", 0.0)
            test_dur = metrics_data.get("test_metrics", {}).get("mean_duration_error_pct", 0.0)
            
            st.markdown(f"- **Period Error**: {test_p:.4f}%")
            st.markdown(f"- **Depth Error**: {test_d:.2f}%")
            st.markdown(f"- **Duration Error**: {test_dur:.2f}%")

    with tab_injection:
        st.markdown("### Injection-Recovery Summary")
        st.markdown("Summary of pipeline transit detection recall and false positive rates during injection trials.")
        
        if os.path.exists(injection_path):
            try:
                df_inj = pd.read_csv(injection_path)
                st.dataframe(df_inj, use_container_width=True, hide_index=True)
            except Exception as e:
                st.error(f"Failed to load injection recovery details: {e}")
        else:
            st.info("Injection recovery summary CSV not found. Run the injection-recovery benchmark suite to generate data.")

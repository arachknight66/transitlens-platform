"""Runs History & Provenance page showing previous run directories, environment details, resolved config, and artifact verification hashes."""
import streamlit as st
import os
import json
import yaml
import pandas as pd

def render():
    st.markdown("## 📋 Runs History & Provenance")
    st.markdown("Inspect resolved run configurations, environment metadata, execution timestamps, and cryptographic artifact checksums.")

    # Locate runs directory
    ml_core_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    runs_dir = os.path.join(ml_core_path, "transitlens-ml-core", "runs")

    if not os.path.exists(runs_dir):
        st.info("No pipeline run records found in the workspace.")
        return

    # Find run subfolders
    run_folders = [f for f in os.listdir(runs_dir) if os.path.isdir(os.path.join(runs_dir, f))]
    if not run_folders:
        st.info("No run subdirectories exist.")
        return

    # Sort run folders (newest first)
    run_folders.sort(reverse=True)

    # Sidebar/Selector for runs
    selected_run = st.selectbox("Select Pipeline Run", run_folders)

    if selected_run:
        run_path = os.path.join(runs_dir, selected_run)
        
        # Load files
        manifest = {}
        manifest_path = os.path.join(run_path, "manifest.json")
        if os.path.exists(manifest_path):
            try:
                with open(manifest_path, "r") as f:
                    manifest = json.load(f)
            except Exception:
                pass

        env_details = {}
        env_path = os.path.join(run_path, "environment.json")
        if os.path.exists(env_path):
            try:
                with open(env_path, "r") as f:
                    env_details = json.load(f)
            except Exception:
                pass

        resolved_config = ""
        config_path = os.path.join(run_path, "resolved_config.yaml")
        if os.path.exists(config_path):
            try:
                with open(config_path, "r") as f:
                    resolved_config = f.read()
            except Exception:
                pass

        # Display run summary
        col1, col2 = st.columns(2)
        with col1:
            st.markdown("### Run Details")
            st.markdown(f"**Run ID**: `{selected_run}`")
            st.markdown(f"**Status**: {manifest.get('status', 'Unknown')}")
            st.markdown(f"**Start Time**: {manifest.get('start_time', '—')}")
            st.markdown(f"**End Time**: {manifest.get('end_time', '—')}")
        with col2:
            st.markdown("### Environment Info")
            st.markdown(f"**OS Platform**: {manifest.get('os_platform', '—')}")
            st.markdown(f"**Python Version**: `{manifest.get('python_version', '—')}`")

        # Tabs for details
        tab_artifacts, tab_config, tab_env = st.tabs([
            "📦 Generated Artifacts", "⚙️ Resolved Configuration", "🖥️ Detailed Environment"
        ])

        with tab_artifacts:
            st.markdown("#### Manifest Artifacts & Hashes")
            artifacts_list = manifest.get("artifacts", [])
            if artifacts_list:
                records = []
                for a in artifacts_list:
                    records.append({
                        "Target ID": a.get("target_id"),
                        "Stage": a.get("stage"),
                        "Relative Path": a.get("relative_path"),
                        "Schema Name": a.get("schema_name"),
                        "Schema Version": a.get("schema_version"),
                        "SHA-256 Hash": a.get("hash"),
                        "Size (Bytes)": a.get("size_bytes"),
                    })
                st.dataframe(pd.DataFrame(records), use_container_width=True, hide_index=True)
            else:
                st.info("No artifacts registered in this run.")

        with tab_config:
            st.markdown("#### resolved_config.yaml")
            if resolved_config:
                st.code(resolved_config, language="yaml")
            else:
                st.info("No resolved configuration saved for this run.")

        with tab_env:
            st.markdown("#### environment.json")
            if env_details:
                st.json(env_details)
            else:
                st.info("No environment information stored for this run.")

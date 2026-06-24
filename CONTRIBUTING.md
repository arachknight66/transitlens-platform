# Contributing to TransitLens Platform

## Development Setup

```bash
git clone https://github.com/transitlens/transitlens-platform
cd transitlens-platform
pip install -r requirements.txt
pip install pytest pytest-cov black
streamlit run main.py
```

## Project Structure

```
app/
├── pages/         # One file per page (home, demo, upload, results, about)
├── components/    # Reusable UI components (result_card, plots, feature_table, etc.)
├── api_client.py  # Bridge to ml-core
├── state.py       # Session state manager
└── utils.py       # Pure utility functions

export/            # HTML, CSV, PDF generators
static/            # CSS, logo, favicon
demo_data/         # Offline demo data
tests/             # Pytest test suite
```

## How to Add a New Page

1. Create `app/pages/your_page.py` with a `render()` function
2. Add the import to `app/pages/__init__.py`
3. Add the route entry to `PAGE_ROUTES` in `main.py`
4. Add a navigation button in `app/components/sidebar.py`
5. Add a breadcrumb mapping in `app/components/header.py`

## How to Add a New Export Format

1. Create `export/your_format.py` with a `generate_your_format(result: dict) -> bytes` function
2. Add the import to `export/__init__.py`
3. Add a `st.download_button()` in `app/pages/results.py` Section 6
4. Add an enable flag in `config.yaml` under the `export` section

## How to Add a New Component

1. Create `app/components/your_component.py` with a `render()` function
2. Components must follow the interface convention:
   - One public function named `render(result=None, **kwargs)`
   - Components never modify session state — they only read via `state.get_*()` functions
   - Components never call `api_client` — they only display data
   - Components never navigate — navigation is handled by pages
3. Add the import to `app/components/__init__.py`

## Code Style

- Format with `black` before committing
- Use docstrings for all public functions
- Import order: stdlib → third-party → local

## Testing

```bash
pytest tests/
pytest tests/ -v --cov=app --cov=export
```

## Regenerating `demo_data/sample_results.json`

After any change to `transitlens-ml-core`'s pipeline or plot generation:

1. Start ml-core: `cd ../transitlens-ml-core && uvicorn api.app:app --port 8000`
2. Run the analysis on each of the three synthetic CSVs
3. Save the JSON output to `demo_data/sample_results.json`
4. Commit the updated file — it should be ~1-2MB

## Pull Request Checklist

- [ ] `streamlit run main.py` launches without errors
- [ ] `pytest tests/` passes with zero failures
- [ ] No imports from `transitlens-ml-core`'s `core/` modules
- [ ] New files have docstrings
- [ ] CSS changes tested in dark theme

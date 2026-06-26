"""Self-contained HTML evidence pack generator."""
import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader
from app.utils import load_config, class_display_name, class_emoji, format_period, format_depth, format_duration, format_confidence

def generate_html(result: dict) -> bytes:
    """Accept a full result dict, render the Jinja2 template, return UTF-8 bytes."""
    template_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")
    env = Environment(loader=FileSystemLoader(template_dir), autoescape=False)
    template = env.get_template("report.html.jinja")

    config = load_config()
    predicted_class = result.get("predicted_class", "noise_or_other")
    confidence_colors = {
        "exoplanet_transit": "#3C3489",
        "eclipsing_binary": "#712B13",
        "blend_contamination": "#D48B00",
        "stellar_variability_or_other": "#444441",
    }

    rendered = template.render(
        result=result,
        class_name=class_display_name(predicted_class),
        class_emoji_val=class_emoji(predicted_class),
        confidence_color=confidence_colors.get(predicted_class, "#444441"),
        confidence_pct=format_confidence(result.get("confidence", 0)),
        period_str=format_period(result.get("period_days", 0)) if result.get("candidate_detected") else "—",
        depth_str=format_depth(result.get("depth", 0)) if result.get("candidate_detected") else "—",
        duration_str=format_duration(result.get("duration_days", 0)) if result.get("candidate_detected") else "—",
        snr_str=f'{result.get("snr", 0):.1f}σ' if result.get("candidate_detected") and result.get("snr") else "—",
        timestamp=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        version=config.get("platform", {}).get("version", "0.1.0"),
        features=result.get("features", {}),
        plots=result.get("plots", {}),
    )
    return rendered.encode("utf-8")

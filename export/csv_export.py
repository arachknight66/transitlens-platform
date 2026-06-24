"""CSV result export."""
import csv
import io

def generate_csv(result: dict) -> bytes:
    """Generate a flat CSV from the result dictionary."""
    output = io.StringIO()
    writer = csv.writer(output)
    
    headers = [
        "target_id", "candidate_detected", "predicted_class", "confidence",
        "period_days", "duration_days", "depth", "snr", "transit_count",
        "bls_power", "odd_even_depth_delta", "v_shape_score", "local_noise",
        "depth_to_noise_ratio", "phase_shape_kurtosis", "explanation",
        "processing_time_ms", "pipeline_version"
    ]
    writer.writerow(headers)
    
    features = result.get("features", {})
    
    def fmt_bool(b):
        if b is None: return ""
        return "true" if b else "false"
        
    def fmt_val(v):
        if v is None: return ""
        return str(v)
        
    row = [
        fmt_val(result.get("target_id")),
        fmt_bool(result.get("candidate_detected")),
        fmt_val(result.get("predicted_class")),
        fmt_val(result.get("confidence")),
        fmt_val(result.get("period_days")),
        fmt_val(result.get("duration_days")),
        fmt_val(result.get("depth")),
        fmt_val(result.get("snr")),
        fmt_val(features.get("transit_count")),
        fmt_val(features.get("bls_power")),
        fmt_val(features.get("odd_even_depth_delta")),
        fmt_val(features.get("v_shape_score")),
        fmt_val(features.get("local_noise")),
        fmt_val(features.get("depth_to_noise_ratio")),
        fmt_val(features.get("phase_shape_kurtosis")),
        fmt_val(result.get("explanation")),
        fmt_val(result.get("processing_time_ms")),
        fmt_val(result.get("pipeline_version"))
    ]
    
    writer.writerow(row)
    return output.getvalue().encode("utf-8")

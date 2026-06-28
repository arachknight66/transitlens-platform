"""PDF summary export."""

def generate_pdf(result: dict) -> bytes:
    """Generate a real minimal PDF 1.4 report showing transit analysis summary."""
    target_id = result.get("target_id", "Unknown")
    predicted_class = result.get("predicted_class", "Unknown")
    confidence = result.get("confidence", 0.0)
    
    report_text = (
        f"TransitLens Scientific Summary Report\n"
        f"=====================================\n\n"
        f"Target ID: {target_id}\n"
        f"Predicted Class: {predicted_class}\n"
        f"Calibrated Probability: {confidence * 100:.1f}%\n"
        f"Transit Fit Status: {result.get('fit_status', 'N/A')}\n"
        f"Pipeline Version: {result.get('pipeline_version', '1.0.0')}\n\n"
        f"Explanation:\n"
        f"------------\n"
        f"{result.get('explanation', '')}\n"
    )
    
    # Construct a valid minimal PDF 1.4 stream
    pdf_content = ""
    for line in report_text.split("\n"):
        escaped_line = line.replace("(", "\\(").replace(")", "\\)")
        pdf_content += f"({escaped_line}) Tj T*\n"
        
    stream_data = (
        "BT\n"
        "/F1 10 Tf\n"
        "50 720 Td\n"
        "14 TL\n"
        f"{pdf_content}"
        "ET\n"
    )
    
    pdf_template = (
        "%PDF-1.4\n"
        "1 0 obj\n"
        "<< /Type /Catalog /Pages 2 0 R >>\n"
        "endobj\n"
        "2 0 obj\n"
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n"
        "endobj\n"
        "3 0 obj\n"
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >> >>\n"
        "endobj\n"
        "4 0 obj\n"
        f"<< /Length {len(stream_data)} >>\n"
        "stream\n"
        f"{stream_data}"
        "endstream\n"
        "endobj\n"
        "xref\n"
        "0 5\n"
        "0000000000 65535 f \n"
        "trailer\n"
        "<< /Size 5 /Root 1 0 R >>\n"
        "%%EOF\n"
    )
    return pdf_template.encode("utf-8", errors="ignore")

"""Methodology page documenting scientific assumptions, exoplanet taxonomy, feature definitions, and parameter mapping."""
import streamlit as st

def render():
    st.markdown("## ⚙️ Methodology & Scientific Contract")
    st.markdown("TransitLens is built on scientifically calibrated exoplanet classification contracts. Below are the definitions and conventions.")

    # 4-class taxonomy section
    st.markdown("### 1. Taxonomy & Data Contracts")
    st.markdown("Every candidate is classified into one of the four categories to avoid scientific label leakage:")
    
    html_tax = '''
    <table class="feature-table">
        <thead>
            <tr>
                <th>Astrophysical Category</th>
                <th>Physical Description</th>
                <th>Diagnostic Criteria</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>🪐 Planetary Transit Candidate</strong></td>
                <td>A planet transiting a host star.</td>
                <td>Symmetric profil, identical odd/even transit depths, depth &le; 5%, no centroid shift.</td>
            </tr>
            <tr>
                <td><strong>⭐ Eclipsing Binary</strong></td>
                <td>A binary companion eclipsing the host star.</td>
                <td>Deep eclipses (> 5%), different odd/even depths, secondary eclipses, or V-shaped profile.</td>
            </tr>
            <tr>
                <td><strong>👥 Blend / Contamination</strong></td>
                <td>Transit-like dip spatially displaced or diluted.</td>
                <td>In-transit centroid shift, nearby stars in Gaia neighbor query, or low crowding metric.</td>
            </tr>
            <tr>
                <td><strong>📊 Stellar Variability / Other</strong></td>
                <td>Intrinsic star spot activity, instrument drift, or noise.</td>
                <td>No periodic signal, BLS power below threshold, low depth SNR.</td>
            </tr>
        </tbody>
    </table>
    '''
    st.markdown(html_tax, unsafe_allow_html=True)
    st.write("")

    # Feature definitions
    st.markdown("### 2. Extracted Features Dictionary")
    st.markdown("The backend extracts the following diagnostic features used by classifiers and rule filters:")
    
    html_feat = '''
    <table class="feature-table">
        <thead>
            <tr>
                <th>Feature Name</th>
                <th>Unit</th>
                <th>Scientific Meaning & Thresholds</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>orbital_period</strong></td>
                <td>Days</td>
                <td>Orbital cycle period detected via BLS peak.</td>
            </tr>
            <tr>
                <td><strong>transit_depth</strong></td>
                <td>Fractional</td>
                <td>Relative drop in flux during transit dips.</td>
            </tr>
            <tr>
                <td><strong>transit_duration</strong></td>
                <td>Days</td>
                <td>Total time companion spends crossing host star disk.</td>
            </tr>
            <tr>
                <td><strong>v_shape_score</strong></td>
                <td>Ratio</td>
                <td>Profile morphology. High (>0.4) indicates eclipsing binaries.</td>
            </tr>
            <tr>
                <td><strong>odd_even_depth_delta</strong></td>
                <td>Ratio</td>
                <td>Depth difference between odd and even transits. >0.02 signals eclipsing binaries.</td>
            </tr>
            <tr>
                <td><strong>centroid_shift</strong></td>
                <td>Arcsec</td>
                <td>Shift in photocenter centroid in-transit. >0.015 suggests nearby contaminant.</td>
            </tr>
            <tr>
                <td><strong>crowding_metric</strong></td>
                <td>Ratio</td>
                <td>Fraction of target flux in aperture. <0.8 indicates significant background dilution.</td>
            </tr>
        </tbody>
    </table>
    '''
    st.markdown(html_feat, unsafe_allow_html=True)
    st.write("")

    # Limb darkening & math formulas
    st.markdown("### 3. Model & Estimation Assumptions")
    st.latex(r"F(t) = 1 - \delta \cdot \text{interpolated\_slope}(t, t_0, \tau, d_{ingress})")
    st.markdown("We model transit shape using an analytical **trapezoidal model** fit. Period uncertainties are estimated using Kovacs scaling:")
    st.latex(r"\sigma_P = \frac{P^2}{T_{span} \cdot \text{SNR}}")

# TransitLens Platform Gateway

The gateway is the frontend's only backend. It validates and orchestrates calls to the Data Pipeline and ML Core; it contains no scientific preprocessing or inference code.

Install and run from this directory:

```powershell
python -m pip install -e ".[test]"
python -m uvicorn transitlens_gateway.app:app --host 127.0.0.1 --port 8000
```

Interactive OpenAPI documentation is served at `http://localhost:8000/docs` and the schema at `/openapi.json`.

Configuration uses environment variables prefixed with `TRANSITLENS_`:

- `PIPELINE_URL` (default `http://localhost:8001`)
- `ML_CORE_URL` (default `http://localhost:8002`)
- `REQUEST_TIMEOUT_SECONDS`
- `CONNECT_TIMEOUT_SECONDS`
- `MAX_UPLOAD_BYTES`
- `SESSION_TTL_SECONDS`
- `ALLOWED_ORIGINS`
- `SESSION_COOKIE_SECURE` (set to `true` behind HTTPS)

Runtime user credentials and service overrides are kept in an expiring in-memory server session and addressed by an HttpOnly SameSite cookie. A production deployment should run behind HTTPS, set `TRANSITLENS_SESSION_COOKIE_SECURE=true`, and restrict configurable upstream hosts at the network boundary.


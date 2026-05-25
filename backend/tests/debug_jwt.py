"""
Paste a live Supabase access token from the browser to diagnose the JWT issue.
Run: python debug_jwt.py <token>
"""
import sys
import base64
import jwt

SECRET_RAW = "OVClanZiku8MbG7evgBzfaH2x6SdCriF3LJFSy4ooCXEOv3IdRmBCEIz96kmluW2tmK9qDRSeUVSyAGda8Y1cQ=="

def test(token: str):
    # Step 1: Print the token header (no verification)
    try:
        header = jwt.get_unverified_header(token)
        print(f"[+] Token header: {header}")
    except Exception as e:
        print(f"[-] Cannot read header: {e}")
        return

    alg = header.get("alg", "?")
    print(f"[+] Token algorithm: {alg}")

    if alg != "HS256":
        print(f"[!] Token is NOT HS256 — it's {alg}! The backend must handle this algorithm.")
        return

    # Step 2: Try with raw string (old broken way)
    print("\n--- Attempt 1: Raw string secret ---")
    try:
        payload = jwt.decode(token, SECRET_RAW, algorithms=["HS256"], audience="authenticated")
        print(f"[+] SUCCESS with raw string! sub={payload.get('sub')}")
    except Exception as e:
        print(f"[-] FAILED with raw string: {e}")

    # Step 3: Try with base64-decoded bytes (new fix)
    print("\n--- Attempt 2: Base64-decoded bytes ---")
    try:
        secret_bytes = base64.b64decode(SECRET_RAW)
        payload = jwt.decode(token, secret_bytes, algorithms=["HS256"], audience="authenticated")
        print(f"[+] SUCCESS with base64-decoded bytes! sub={payload.get('sub')}")
        print(f"    email={payload.get('email')}")
    except Exception as e:
        print(f"[-] FAILED with base64-decoded bytes: {e}")

    # Step 4: Try without audience validation
    print("\n--- Attempt 3: Base64 bytes, no audience check ---")
    try:
        secret_bytes = base64.b64decode(SECRET_RAW)
        payload = jwt.decode(token, secret_bytes, algorithms=["HS256"])
        print(f"[+] SUCCESS without audience! aud={payload.get('aud')}")
    except Exception as e:
        print(f"[-] FAILED without audience: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python debug_jwt.py <supabase_access_token>")
        print("\nTo get the token:")
        print("  Open browser devtools -> Application -> Local Storage")
        print("  Find the key containing 'supabase' and copy 'access_token'")
        sys.exit(1)
    test(sys.argv[1])

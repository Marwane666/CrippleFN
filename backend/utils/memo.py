import json, binascii

MAX_MEMO_BYTES = 1024                # protocol cap :contentReference[oaicite:3]{index=3}

def encode_memo(payload: dict) -> str:
    """
    JSON ➜ bytes ➜ hex, raising ValueError if > 1 024 bytes.
    """
    raw = json.dumps(payload, separators=(",", ":")).encode()
    if len(raw) > MAX_MEMO_BYTES:
        raise ValueError("Memo too large")
    return binascii.hexlify(raw).decode()

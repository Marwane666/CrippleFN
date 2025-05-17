#!/usr/bin/env python3

import os
import asyncio
import json
from decimal import Decimal

from dotenv import load_dotenv
from xrpl.asyncio.account import get_balance

from backend.services.xrpl_service import XRPLService

async def main() -> None:
    load_dotenv()  # charge .env (XRPL_* + SUPABASE_*)

    svc = XRPLService()

    # 1) Affichage des soldes
    async with svc._client() as client:
        hot_bal  = await get_balance(os.environ["XRPL_HOT_ADDR"], client)
        test_bal = await get_balance(os.environ["XRPL_TEST_ADDR"], client)
    print(f"Soldes (drops) HOT = {hot_bal:,}   TEST = {test_bal:,}")

    # 2) Anchor news
    tx1 = await svc.anchor_news(
        news_id=1,
        content="Breaking News: DevNet is awesome!",
        verdict="TRUE",
    )
    print("Hash ancrage  :", tx1)

    # 3) Metadata anchor
    meta1 = await svc.fetch_transaction_metadata(tx1)
    print("Metadata ancrage :")
    print(json.dumps(meta1, indent=2))

    # 4) Insert into xrpl_scores
    result1 = await svc.save_xrpl_score(record_id=1, tx_hash=tx1, meta=meta1)
    print("→ xrpl_scores insert (anchor):", result1)

    # 5) Test payment
    tx2 = await svc.test_payment(amount_xrp=Decimal("1"))
    print("Hash paiement :", tx2)

    # 6) Metadata payment
    meta2 = await svc.fetch_transaction_metadata(tx2)
    print("Metadata paiement :")
    print(json.dumps(meta2, indent=2))

    # 7) Insert payment into xrpl_scores
    result2 = await svc.save_xrpl_score(record_id=1, tx_hash=tx2, meta=meta2)
    print("→ xrpl_scores insert (payment):", result2)

if __name__ == "__main__":
    asyncio.run(main())

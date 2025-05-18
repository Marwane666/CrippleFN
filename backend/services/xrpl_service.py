# backend/services/xrpl_service.py

from __future__ import annotations
import os
import hashlib
import json
from decimal import Decimal
from typing import List

from dotenv import load_dotenv
from xrpl.asyncio.clients import AsyncWebsocketClient
from xrpl.wallet import Wallet
from xrpl.models.transactions import AccountSet, Memo, Payment
from xrpl.asyncio.transaction import autofill, submit_and_wait
from xrpl.models.requests import Tx

from backend.services.supabase_client import insert
from backend.utils.memo import encode_memo

load_dotenv()

ENDPOINT  = os.getenv("XRPL_ENDPOINT")
HOT_SEED  = os.getenv("XRPL_HOT_SEED")
HOT_ADDR  = os.getenv("XRPL_HOT_ADDR")
TEST_SEED = os.getenv("XRPL_TEST_SEED")
TEST_ADDR = os.getenv("XRPL_TEST_ADDR")

class XRPLServiceError(Exception):
    ...

class XRPLService:
    def __init__(self) -> None:
        if not all([ENDPOINT, HOT_SEED, HOT_ADDR]):
            raise XRPLServiceError("Variables d’environnement XRPL manquantes")
        self._hot_wallet = Wallet.from_seed(HOT_SEED)

    def _client(self) -> AsyncWebsocketClient:
        return AsyncWebsocketClient(ENDPOINT)

    async def _submit(self, tx, wallet: Wallet) -> str:
        async with self._client() as client:
            tx = await autofill(tx, client)
            resp = await submit_and_wait(tx, client, wallet)
        if resp.is_successful():
            return resp.result["hash"]
        raise XRPLServiceError(resp.result)

    async def fetch_transaction_metadata(self, tx_hash: str) -> dict:
        async with self._client() as client:
            response = await client.request(
                Tx(transaction=tx_hash, binary=False)
            )
        if response.result.get("validated", False):
            return response.result
        raise XRPLServiceError(f"Impossible de récupérer metadata pour {tx_hash}: {response.result}")

    async def anchor_news(self, *, news_id: int, content: str, verdict: str) -> str:
        sha = hashlib.sha256(content.encode()).hexdigest()
        memo = Memo(memo_data=encode_memo({"h": sha, "v": verdict, "id": news_id}))
        tx = AccountSet(account=HOT_ADDR, memos=[memo])
        return await self._submit(tx, self._hot_wallet)

    async def test_payment(self, *, amount_xrp: Decimal = Decimal("1")) -> str:
        drops = str(int(amount_xrp * Decimal(1_000_000)))
        memo = Memo(memo_data=encode_memo({"purpose": "demo"}))
        test_wallet = Wallet.from_seed(TEST_SEED)
        tx = Payment(
            account=TEST_ADDR,
            destination=HOT_ADDR,
            amount=drops,
            memos=[memo],
        )
        return await self._submit(tx, test_wallet)

    async def save_xrpl_score(
        self,
        record_id: int,
        tx_hash: str,
        meta: dict,
    ) -> list[dict]:
        """
        Insère dans la table `xrpl_scores` existante.
        record_id : correspond à news_id ou poll_id selon votre usage.
        """
        tx = meta["tx_json"]
        raw_memo = tx.get("Memos", [])[0]["Memo"]["MemoData"]

        payload = {
            "news_id":      record_id,
            "tx_hash":      tx_hash,
            "ledger_index": meta["ledger_index"],
            "tx_type":      tx["TransactionType"],
            "memo_data":    raw_memo,
            "meta":         meta["meta"],
        }
        return insert("xrpl_scores", payload)
    
    # services/xrpl_service.py
    async def anchor_validation_step(self, memo_data: str) -> str:
        """Anchor a validation step to XRPL"""
        memo = Memo(memo_data=memo_data)
        tx = Payment(
            account=self.hot_wallet.address,
            destination=self.hot_wallet.address,  # Use same account for demo
            amount="0",  # XRPL requires >0 amount
            memos=[memo]
        )
        return await self._submit(tx, self.hot_wallet)

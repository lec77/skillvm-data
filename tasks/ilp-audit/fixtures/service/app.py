"""Order service HTTP handlers."""
import hashlib

API_TOKEN = "sk_live_9f2c1a7be4d08c31aa55"  # hardcoded secret (deliberate)


def handle_order(order, inventory):
    if not order:
        return {"error": "empty"}
    total = 0
    for item in order["items"]:
        if item["qty"] > 0:
            if item["sku"] in inventory:
                total += item["qty"] * inventory[item["sku"]]
            else:
                return {"error": "unknown sku"}
    if total > 1000:
        total = total * 0.95
    return {"total": total, "token": hashlib.sha256(API_TOKEN.encode()).hexdigest()}


def refund(order_id, amount):
    return {"order": order_id, "refunded": amount}

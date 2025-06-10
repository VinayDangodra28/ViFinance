import requests
import json
import uuid
from datetime import datetime
import re

API_KEY = "AIzaSyBYGcNPmwiakoc03KXGZkTXW-btfGt_itk"
API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={API_KEY}"

def clean_json_block(text):
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    return match.group(1) if match else None

def parse_finance_message_with_gemini(message: str) -> dict:
    headers = {
        "Content-Type": "application/json"
    }

    prompt = f"""
You are a financial message parser. From the user's message, extract useful structured data and return a JSON object. Include a short natural-language note about the transaction. Format:

{{
  "type": "expense" | "income",
  "amount": 1234,
  "category": "food" | "rent" | etc,
  "date": "YYYY-MM-DD" | null,
  "note": "Natural-language summary of the transaction."
}}

Extract from: "{message}"

Return clean JSON only.
"""

    payload = {
        "contents": [
            {
                "parts": [
                    { "text": prompt.strip() }
                ]
            }
        ]
    }

    response = requests.post(API_URL, headers=headers, data=json.dumps(payload))

    with open("raw_gemini_response.txt", "w", encoding="utf-8") as f:
        f.write(response.text)

    try:
        raw = response.json()
        raw_text = raw["candidates"][0]["content"]["parts"][0]["text"]
        clean_json_str = clean_json_block(raw_text)

        if clean_json_str is None:
            raise ValueError("No valid JSON block found")

        parsed_data = json.loads(clean_json_str)

        return {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "original_message": message,
            "parsed_data": parsed_data
        }

    except Exception as e:
        print(f"❌ Failed to parse Gemini response: {e}")
        return {
            "id": str(uuid.uuid4()),
            "timestamp": datetime.now().isoformat(),
            "original_message": message,
            "parsed_data": {
                "error": "Failed to parse response",
                "note": "Could not understand the message."
            }
        }

def save_finance_json(data: dict, filename="finance_entries.json"):
    try:
        with open(filename, "r", encoding="utf-8") as f:
            content = f.read().strip()
            existing = json.loads(content) if content else []
    except (FileNotFoundError, json.JSONDecodeError):
        existing = []

    existing.append(data)

    with open(filename, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=2)

    print(f"✅ Saved to {filename}")

def generate_chat_response(parsed_data: dict) -> str:
    if "error" in parsed_data:
        return "❗ I couldn't understand that. Please try rephrasing."

    amount = parsed_data.get("amount", "some amount")
    category = parsed_data.get("category", "unknown")
    entry_type = parsed_data.get("type", "entry")

    if entry_type == "expense":
        return f"💸 Got it! Added an expense of ₹{amount} for {category}."
    elif entry_type == "income":
        return f"💰 Nice! Logged ₹{amount} received as {category}."
    else:
        return f"✅ Noted your entry of ₹{amount} under {category}."

# ▶️ Main loop
if __name__ == "__main__":
    while True:
        chat_message = input("💬 Enter a finance message (or type 'exit'): ").strip()
        if chat_message.lower() == "exit":
            break

        result = parse_finance_message_with_gemini(chat_message)
        save_finance_json(result)

        parsed = result.get("parsed_data", {})
        print(generate_chat_response(parsed))
        if "note" in parsed:
            print(f"📝 Note: {parsed['note']}")

#!/usr/bin/env python3
"""Extract structured data from HTML and write JSON-LD schema files.

Usage:
  python scripts/html2jsonld.py <input.html> <output.json> <schema-type>

Supported schema types: faqpage, product
"""

import sys
import json
import re
from html.parser import HTMLParser


class SimpleHTMLParser(HTMLParser):
    """Parse HTML into a flat list of elements with their text content."""
    def __init__(self):
        super().__init__()
        self.elements = []
        self.tag_stack = []
        self.class_stack = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get("class", "")
        self.tag_stack.append(tag)
        self.class_stack.append(cls)

    def handle_endtag(self, tag):
        if self.tag_stack and self.tag_stack[-1] == tag:
            self.tag_stack.pop()
            self.class_stack.pop()

    def handle_data(self, data):
        text = data.strip()
        if not text:
            return
        # Record the text with all parent tags/classes
        self.elements.append({
            "text": text,
            "tag": self.tag_stack[-1] if self.tag_stack else "",
            "class": self.class_stack[-1] if self.class_stack else "",
            "parent_classes": list(self.class_stack),
        })


def has_class(element, cls_name):
    """Check if element or any of its parents has the given class."""
    for c in element["parent_classes"]:
        if cls_name in c:
            return True
    return False


def extract_faq(html_content):
    """Extract FAQ questions and answers from HTML."""
    parser = SimpleHTMLParser()
    parser.feed(html_content)

    questions = []
    current_question = None

    for el in parser.elements:
        tag = el["tag"]
        text = el["text"]

        if tag == "h3" and "?" in text:
            if current_question and current_question["answer"]:
                questions.append(current_question)
            current_question = {"question": text, "answer": ""}
        elif tag == "p" and current_question and not current_question["answer"]:
            current_question["answer"] = text

    if current_question and current_question["answer"]:
        questions.append(current_question)

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": q["question"],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": q["answer"]
                }
            }
            for q in questions
        ]
    }


def extract_product(html_content):
    """Extract product information from HTML."""
    parser = SimpleHTMLParser()
    parser.feed(html_content)

    product_name = ""
    description = ""
    brand = ""
    sku = ""
    price = 0.0
    currency = "USD"
    availability = "InStock"
    rating_value = ""
    review_count = ""

    for el in parser.elements:
        tag = el["tag"]
        cls = el["class"]
        text = el["text"]

        # Product name: h2 with class product-name, or h1/h2 with product-like content
        if "product-name" in cls:
            product_name = text

        # Description: text inside a product-description container
        if has_class(el, "product-description") and tag == "p":
            description = text

        # Brand: look for text in strong/span inside brand class, or "Brand: X" pattern
        if has_class(el, "brand"):
            if tag in ("strong", "b", "span") and text and "Brand" not in text:
                brand = text
            elif "Brand:" in text:
                m = re.search(r'Brand:\s*(.+)', text)
                if m:
                    brand = m.group(1).strip()

        # SKU: look for text in span inside sku class, or "SKU: X" pattern
        if has_class(el, "sku"):
            if tag == "span" and re.match(r'^[A-Z0-9][\w-]+$', text):
                sku = text
            elif "SKU:" in text:
                m = re.search(r'SKU:\s*(\S+)', text)
                if m:
                    sku = m.group(1)

        # Price amount
        if "amount" in cls:
            m = re.search(r'[\$]?([\d,]+\.?\d*)', text)
            if m:
                price = float(m.group(1).replace(",", ""))

        # Currency
        if "currency" in cls:
            currency = text.strip()

        # Availability
        if has_class(el, "availability"):
            lower = text.lower()
            if "in stock" in lower:
                availability = "InStock"
            elif "out of stock" in lower:
                availability = "OutOfStock"

        # Rating value
        if "rating-value" in cls:
            rating_value = text.strip()

        # Review count
        if "review-count" in cls:
            review_count = text.strip()

    # Fallback: scan all text for patterns if values not found
    if not price:
        for el in parser.elements:
            m = re.search(r'\$([\d,]+\.?\d*)', el["text"])
            if m:
                price = float(m.group(1).replace(",", ""))
                break

    if not brand:
        for el in parser.elements:
            m = re.search(r'Brand:\s*(\w+)', el["text"])
            if m:
                brand = m.group(1)
                break

    if not sku:
        for el in parser.elements:
            m = re.search(r'SKU:\s*(\S+)', el["text"])
            if m:
                sku = m.group(1)
                break

    schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product_name,
        "description": description,
        "sku": sku,
        "brand": {
            "@type": "Organization",
            "name": brand
        },
        "offers": {
            "@type": "Offer",
            "price": price,
            "priceCurrency": currency,
            "availability": f"https://schema.org/{availability}"
        }
    }

    if rating_value and review_count:
        schema["aggregateRating"] = {
            "@type": "AggregateRating",
            "ratingValue": rating_value,
            "reviewCount": review_count
        }

    return schema


def main():
    if len(sys.argv) != 4:
        print(f"Usage: {sys.argv[0]} <input.html> <output.json> <faqpage|product>")
        sys.exit(1)

    input_file, output_file, schema_type = sys.argv[1], sys.argv[2], sys.argv[3].lower()

    with open(input_file, "r") as f:
        html_content = f.read()

    if schema_type == "faqpage":
        schema = extract_faq(html_content)
    elif schema_type == "product":
        schema = extract_product(html_content)
    else:
        print(f"Unknown schema type: {schema_type}. Use 'faqpage' or 'product'.")
        sys.exit(1)

    with open(output_file, "w") as f:
        json.dump(schema, f, indent=2)

    print(f"Schema written to {output_file}")


if __name__ == "__main__":
    main()

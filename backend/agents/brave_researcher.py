import httpx
from graph.state import DevDocState
from config import get_settings

settings = get_settings()

BRAVE_SEARCH_URL = "https://api.search.brave.com/res/v1/web/search"

# Helper function to search Brave for external context
async def brave_search(query: str, count: int = 3) -> list[dict]:
    """
    Search Brave for external context about a library or concept.
    Returns top results with title, url, description.
    """
    headers = {
        "Accept": "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": settings.BRAVE_SEARCH_API_KEY,
    }
    params = {
        "q": query,
        "count": count,
        "text_decorations": False,
        "search_lang": "en",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(BRAVE_SEARCH_URL, headers=headers, params=params)

    if response.status_code != 200:
        return []

    data = response.json()
    results = data.get("web", {}).get("results", [])

    return [
        {
            "title": r.get("title", ""),
            "url": r.get("url", ""),
            "description": r.get("description", ""),
        }
        for r in results
    ]

def extract_key_imports(module: dict) -> list[str]:
    """
    Extract third-party library names from imports.
    Skip stdlib and local imports.
    """
    stdlib = {
        "os", "sys", "json", "re", "uuid", "datetime", "typing",
        "pathlib", "collections", "itertools", "functools", "abc",
        "asyncio", "logging", "enum", "dataclasses", "base64",
    }

    third_party = []
    for imp in module.get("imports", []):
        root = imp.split(".")[0]
        if root and root not in stdlib and not root.startswith("_"):
            third_party.append(root)

    return list(set(third_party))

# LangGraph node — enriches generated docs with external context.
async def brave_researcher_node(state: DevDocState) -> dict:
    """
    LangGraph node — enriches generated docs with external context.

    For each module:
    1. Extract third-party library imports
    2. Search Brave for best practices / usage guides
    3. Append external links and context to the doc

    This makes docs more useful — not just "what does this do"
    but also "here's the official docs and best practices."
    """
    print(f"Enriching {len(state.generated_docs)} docs with Brave Search")

    enriched_docs = []

    for doc in state.generated_docs:
        # Find the matching parsed module to get imports
        parsed = next(
            (m for m in state.parsed_modules if m["file_path"] == doc["file_path"]),
            None
        )

        if not parsed:
            enriched_docs.append(doc)
            continue

        # Get third-party libraries used in this module
        libraries = extract_key_imports(parsed)

        if not libraries:
            enriched_docs.append(doc)
            continue

        # Search for each library
        external_links = []
        for lib in libraries[:3]:   # max 3 libraries per module
            query = f"{lib} Python library best practices documentation"
            results = await brave_search(query, count=2)
            external_links.extend(results)
            print(f"Searched: {lib} → {len(results)} results")

        # Append external resources section to the doc
        if external_links:
            resources_section = "\n\n## 🔗 External Resources\n"
            for link in external_links[:4]:   # max 4 links total
                resources_section += f"- [{link['title']}]({link['url']}) — {link['description'][:100]}\n"

            enriched_doc = {**doc, "content": doc["content"] + resources_section}
        else:
            enriched_doc = doc

        enriched_docs.append(enriched_doc)
        print(f"Enriched: {doc['file_path']}")

    return {
        "enriched_docs": enriched_docs,
        "current_step": "brave_researcher",
    }
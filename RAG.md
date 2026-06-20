# MCP Server Generator — RAG

**Honest scope:** this product is NOT RAG-centric. It's a code-generation tool; there is no large runtime knowledge base to retrieve over. This doc records the *narrow, optional* places retrieval helps, so the requirement is met without inventing a fake RAG system. General method: [../RAG_GUIDE.md](../RAG_GUIDE.md).

## Where (light) retrieval helps
| Use | Technique | Stage |
|-----|-----------|-------|
| **Template/example retrieval** | Embed templates + popular API patterns; semantic search to suggest a starting template for a given spec | V1 |
| **Description few-shot examples** | Retrieve high-quality example descriptions similar to the current tool to ground the LLM's generation | V1/V2 |
| **Codebase understanding (V2 input)** | Reuse #2's RAG-over-code to understand functions before wrapping them | V2 |
| **Docs assistant** | RAG over MCP docs + our docs to answer user "how do I..." questions in-app | V2 |

## Implementation (if/when needed)
- pgvector (D-004) for template/example embeddings (small corpus → trivial scale).
- Provider-abstracted embeddings (`packages/llm`).
- For codebase input, reuse `packages/rag` (AST chunker + retrieval) from Codebase Intelligence (#2) rather than reinventing.

## What we deliberately do NOT build
- No per-server runtime RAG (generated servers call APIs/DBs directly; they don't retrieve).
- No heavy chunking/re-ranking pipeline — unnecessary for this product's value.

## Cross-reference
The serious RAG work lives in [../codebase-intelligence/RAG.md](../codebase-intelligence/RAG.md) and is *reused* here for the V2 codebase-input feature. Keeping RAG out of the MVP is a deliberate scoping decision that keeps this the fast wedge.

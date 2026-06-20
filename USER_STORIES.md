# MCP Server Generator — USER STORIES

100+ stories. Personas: **Dev** (builder), **Agency**, **Lead**, **Platform** (DevEx/platform eng), **Sec**, **SaaSowner**, **Admin**, **Agent** (consumes generated servers). Tags `[MVP|V1|V2|V3]`.

## Epic A — Generate from OpenAPI
1. As a Dev, I want to paste an OpenAPI URL/file, so that generation starts. [MVP]
2. As a Dev, I want each endpoint mapped to an MCP tool, so that the API is fully callable. [MVP]
3. As a Dev, I want great auto-generated tool descriptions, so that the LLM calls tools correctly. [MVP]
4. As a Dev, I want to edit descriptions before generating, so that I refine them. [MVP]
5. As a Dev, I want input schemas (Zod) from the spec, so that args are validated. [MVP]
6. As a Dev, I want to select which endpoints to include, so that I avoid bloat. [MVP]
7. As a Dev, I want auth (API key/OAuth) scaffolded from the spec's security, so that it's production-ready. [MVP]
8. As a Dev, I want error handling generated, so that the LLM gets recoverable errors. [MVP]
9. As a Dev, I want rate limiting scaffolded, so that the server is safe. [MVP]
10. As a Dev, I want a README + run instructions generated, so that I can use it immediately. [MVP]

## Epic B — Output & run
11. As a Dev, I want to download the generated code as a repo, so that I own and run it anywhere. [MVP]
12. As a Dev, I want the server to run via stdio for Claude Desktop, so that I test locally fast. [MVP]
13. As a Dev, I want an `mcp.json` snippet generated, so that I wire it into my host instantly. [MVP]
14. As a Dev, I want to preview/test tools in the web UI before downloading, so that I'm confident. [MVP]
15. As a Dev, I want a CLI (`mcpgen <spec>`), so that I generate from my terminal/CI. [MVP]
16. As a Dev, I want generated TypeScript by default, so that it fits my stack. [MVP]
17. As a Dev, I want generated Python option, so that it fits Python teams. [V2]
18. As a Dev, I want the code to be clean/idiomatic, so that I can maintain it. [MVP]

## Epic C — Generate from Database
19. As a Dev, I want to connect a Postgres schema, so that I expose data to AI. [V1]
20. As a Dev, I want only safe parameterized read queries generated, so that there's no SQL injection. [V1]
21. As a Sec, I want write/destructive DB operations off by default, so that data is protected. [V1]
22. As a Dev, I want to choose which tables/columns are exposed, so that I control data exposure. [V1]
23. As a Dev, I want MySQL support too, so that my stack is covered. [V1]
24. As a Sec, I want PII columns flagged/excluded, so that we don't leak personal data. [V2]
25. As a Dev, I want row-level filters configurable, so that tenant data stays isolated. [V2]

## Epic D — Generate from GraphQL & Codebase
26. As a Dev, I want to generate from a GraphQL schema, so that queries/mutations become tools. [V1]
27. As a Dev, I want mutations flagged as destructive, so that they're gated. [V1]
28. As a Dev, I want to generate from my codebase functions, so that internal logic is callable. [V2]
29. As a Dev, I want to annotate which functions to expose, so that I control surface. [V2]
30. As a Dev, I want types inferred from my code, so that schemas are accurate. [V2]

## Epic E — Tool description quality (the moat)
31. As a Dev, I want descriptions stating what/when/when-not to use a tool, so that the LLM chooses correctly. [MVP]
32. As a Dev, I want parameter docs generated, so that the LLM fills args right. [MVP]
33. As a Dev, I want a "description quality score" + suggestions, so that I improve weak ones. [V2]
34. As a Dev, I want examples generated in descriptions, so that the LLM has guidance. [V1]
35. As a Dev, I want descriptions injection-aware (don't trust returned data as instructions), so that servers are safe. [V2]

## Epic F — Hosting & Deploy
36. As a Dev, I want one-click hosted deployment, so that my team/agents can use the server remotely. [V1]
37. As a Dev, I want HTTP/streamable transport for hosted servers, so that remote clients connect. [V1]
38. As a Dev, I want secrets stored securely for hosted servers, so that credentials are safe. [V1]
39. As a Dev, I want a stable URL + API key for my hosted server, so that I can share it. [V1]
40. As a Dev, I want auto-scaling/uptime for hosted servers, so that they're reliable. [V1]
41. As a Dev, I want to redeploy on spec change, so that the server stays current. [V1]
42. As a Dev, I want to export hosted config to self-host later, so that I'm not locked in. [V1]
43. As a SaaSowner, I want a branded public MCP server hosted, so that customers use my product from AI. [V1]

## Epic G — Testing & Observability
44. As a Dev, I want an MCP inspector to call tools and see results, so that I verify behavior. [V1]
45. As a Dev, I want tool-call logs (args, result, latency, errors), so that I debug. [V2]
46. As a Lead, I want usage analytics per tool/server, so that I see adoption. [V2]
47. As a Dev, I want error/latency alerts on hosted servers, so that I catch issues. [V2]
48. As a Dev, I want traces of tool calls, so that I diagnose agent failures. [V2]
49. As a Dev, I want cost tracking for LLM-assisted features, so that I control spend. [V1]

## Epic H — Teams & Collaboration
50. As a Lead, I want shared servers across the team, so that we reuse integrations. [V1]
51. As an Admin, I want RBAC on servers, so that access matches policy. [V1]
52. As a Lead, I want templates of our common APIs, so that the team generates consistently. [V1]
53. As a Platform eng, I want org standards baked into templates, so that all servers comply. [V3]
54. As a Lead, I want server versioning + changelog, so that updates are tracked. [V1]

## Epic I — Security & Governance
55. As a Sec, I want auth required on every generated server, so that nothing is open. [MVP]
56. As a Sec, I want validation on all tool inputs, so that bad args are rejected. [MVP]
57. As a Sec, I want destructive tools gated behind HITL config, so that nothing dangerous runs unattended. [V2]
58. As a Sec, I want sandboxed execution for code-running tools, so that they can't damage systems. [V2]
59. As a Sec, I want an audit log of generation + tool calls, so that we can investigate. [V2]
60. As an Admin, I want only approved servers usable org-wide, so that we govern sprawl. [V3]
61. As a Sec, I want secrets never embedded in generated code, so that we don't leak keys. [MVP]
62. As a Sec, I want SSO + on-prem, so that enterprise policy is met. [V3]
63. As a Sec, I want generated servers to pass a security lint, so that quality is enforced. [V2]

## Epic J — Marketplace & Registry
64. As a Dev, I want to publish my server to a marketplace, so that others discover it. [V2]
65. As a Dev, I want to browse/install community servers, so that I reuse work. [V2]
66. As an Admin, I want a private org registry, so that internal servers are discoverable + governed. [V3]
67. As a Dev, I want servers security-reviewed before listing, so that I trust them. [V2]
68. As a creator, I want to monetize a published server, so that I earn (feeds #7). [V3]

## Epic K — Billing & Plans
69. As a Dev, I want a free tier (generate + download, limited), so that I can evaluate. [MVP]
70. As a Dev, I want self-serve Pro (unlimited generation + hosting credits), so that I unlock more. [MVP]
71. As a SaaSowner, I want hosting priced by usage, so that costs match traffic. [V1]
72. As a Lead, I want Team seats, so that the org can collaborate. [V1]
73. As an Admin, I want Enterprise invoicing, so that procurement works. [V3]

## Epic L — DX & Quality
74. As a Dev, I want generation in seconds, so that it fits my flow. [MVP]
75. As a Dev, I want clear errors when a spec is invalid, so that I fix it fast. [MVP]
76. As a Dev, I want generated tests for the server, so that I trust it. [V1]
77. As a Dev, I want the generated repo to include CI + Dockerfile, so that it's deploy-ready. [V1]
78. As a Dev, I want regeneration to preserve my manual edits, so that I don't lose work. [V1]
79. As a Dev, I want documentation of each tool generated, so that consumers understand it. [MVP]
80. As a Dev, I want a changelog when I regenerate, so that I see what changed. [V1]

## Epic M — Integration with the lab
81. As a ContextOS user, I want to generate a server for a custom internal tool, so that my agent uses it. [V2]
82. As a ContextOS admin, I want generated servers governed centrally, so that the hub manages them. [V2]
83. As a Codebase Intelligence user, I want to expose the codebase API as a generated server, so that agents query it. [V2]

## Epic N — Agent consumption
84. As an Agent, I want well-described tools, so that I call them correctly. [MVP]
85. As an Agent, I want structured errors, so that I recover gracefully. [MVP]
86. As an Agent, I want consistent server behavior, so that automations are reliable. [V1]
87. As an Agent, I want resources (readable data) exposed, not just tools, so that I load context. [V1]
88. As an Agent, I want prompts exposed, so that I reuse parameterized templates. [V1]

## Epic O — Reliability
89. As a Dev, I want hosted servers to have uptime SLA, so that I depend on them. [V3]
90. As a Dev, I want graceful handling when upstream API is down, so that the agent isn't broken. [V1]
91. As a Dev, I want idempotency on cost/side-effect tools, so that retries are safe. [V1]
92. As a Dev, I want timeouts on tool calls, so that agents don't hang. [MVP]

## Epic P — Onboarding & growth
93. As a Dev, I want a public demo (generate from a sample spec), so that I see value without signup. [MVP]
94. As a Dev, I want one-command CLI install, so that I start instantly. [MVP]
95. As a Dev, I want example gallery (servers for popular APIs), so that I start from a template. [V1]
96. As a Dev, I want to share my generated server config, so that teammates reuse it. [V1]
97. As a Dev, I want docs/tutorials, so that I learn MCP while using the tool. [MVP]

## Epic Q — Maintenance
98. As a Dev, I want notification when an upstream spec changes, so that I regenerate. [V2]
99. As a Dev, I want auto-regeneration on upstream change (opt-in), so that the server stays current. [Future]
100. As a Dev, I want deprecation warnings for removed endpoints, so that I update consumers. [V2]
101. As a Lead, I want to see which servers are stale, so that we maintain them. [V2]
102. As a Dev, I want version pinning of the MCP SDK in generated code, so that builds are stable. [MVP]

---
*Drives [TASKS.md](./TASKS.md) / [SPRINTS.md](./SPRINTS.md). MVP scope = [MVP] tags. The free OpenAPI→server flow (1–16, 31–32, 55–56, 69, 74, 84, 93–94) is the wedge.*

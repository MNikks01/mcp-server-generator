import { test } from "node:test";
import assert from "node:assert/strict";
import type { FileDoc } from "../src/codebase/types.ts";
import { detectSecurity, normalizePath } from "../src/codebase/discover.ts";
import { scanFilesToIR, ScanError } from "../src/codebase/scan.ts";

function toolsOf(files: FileDoc[]) {
  const ir = scanFilesToIR(files);
  return new Map(ir.tools.map((t) => [`${t.method} ${t.path}`, t]));
}

test("normalizePath: every framework's param syntax -> {param}", () => {
  assert.equal(normalizePath("/users/:id"), "/users/{id}"); // express/fastify
  assert.equal(normalizePath("/users/:id(\\d+)"), "/users/{id}"); // express regex param
  assert.equal(normalizePath("/posts/[slug]"), "/posts/{slug}"); // next dynamic
  assert.equal(normalizePath("/docs/[...path]"), "/docs/{path}"); // next catch-all
  assert.equal(normalizePath("/items/<int:item_id>"), "/items/{item_id}"); // flask typed
  assert.equal(normalizePath("/(marketing)/about"), "/about"); // next route group dropped
});

test("Express: app.get / router.post with path params + body", () => {
  const tools = toolsOf([
    {
      path: "src/routes.js",
      content: `
        const app = express();
        app.get('/users', (req, res) => res.json([]));
        router.post('/users/:id', (req, res) => res.sendStatus(201));
      `,
    },
  ]);
  assert.ok(tools.has("GET /users"));
  const post = tools.get("POST /users/{id}");
  assert.ok(post, "POST /users/{id} discovered");
  assert.equal(post!.name, "post_users_id");
  assert.ok(post!.sideEffecting);
  assert.ok(post!.params.some((p) => p.in === "path" && p.name === "id"));
  assert.ok(post!.params.some((p) => p.in === "body"), "writes get a body param");
});

test("Express: .route('/x').get().post() chain", () => {
  const tools = toolsOf([
    { path: "api.ts", content: `app.route('/widgets').get(list).post(create);` },
  ]);
  assert.ok(tools.has("GET /widgets"));
  assert.ok(tools.has("POST /widgets"));
});

test("Next.js app router: route.ts dir -> path, exports -> methods", () => {
  const tools = toolsOf([
    {
      path: "app/api/items/[id]/route.ts",
      content: `export async function GET() {}\nexport const DELETE = async () => {};`,
    },
  ]);
  assert.ok(tools.has("GET /api/items/{id}"));
  assert.ok(tools.has("DELETE /api/items/{id}"));
});

test("Next.js pages/api: file path -> route (GET)", () => {
  const tools = toolsOf([{ path: "pages/api/health.ts", content: `export default function handler() {}` }]);
  assert.ok(tools.has("GET /api/health"));
});

test("Fastify: object route form with method array", () => {
  const tools = toolsOf([
    { path: "server.js", content: `fastify.route({ method: ['GET','PUT'], url: '/things/:tid' });` },
  ]);
  assert.ok(tools.has("GET /things/{tid}"));
  assert.ok(tools.has("PUT /things/{tid}"));
});

test("NestJS: @Controller base + @Get/@Post decorators", () => {
  const tools = toolsOf([
    {
      path: "cats.controller.ts",
      content: `
        @Controller('cats')
        export class CatsController {
          @Get(':id') findOne() {}
          @Post() create() {}
        }
      `,
    },
  ]);
  assert.ok(tools.has("GET /cats/{id}"));
  assert.ok(tools.has("POST /cats"));
});

test("FastAPI: @app.get / @router.post decorators", () => {
  const tools = toolsOf([
    {
      path: "main.py",
      content: `
        @app.get("/ping")
        def ping(): ...
        @router.post("/dogs/{dog_id}")
        def create(dog_id: int): ...
      `,
    },
  ]);
  assert.ok(tools.has("GET /ping"));
  const post = tools.get("POST /dogs/{dog_id}");
  assert.ok(post);
  assert.ok(post!.params.some((p) => p.in === "path" && p.name === "dog_id"));
});

test("Flask: @app.route with methods list (defaults GET)", () => {
  const tools = toolsOf([
    {
      path: "app.py",
      content: `
        @app.route("/health", methods=["GET", "POST"])
        def health(): ...
        @bp.route("/info")
        def info(): ...
      `,
    },
  ]);
  assert.ok(tools.has("GET /health"));
  assert.ok(tools.has("POST /health"));
  assert.ok(tools.has("GET /info"));
});

test("dedupes identical routes across files", () => {
  const ir = scanFilesToIR([
    { path: "a.js", content: `app.get('/x', h);` },
    { path: "b.js", content: `router.get('/x', h2);` },
  ]);
  assert.equal(ir.tools.filter((t) => t.path === "/x" && t.method === "GET").length, 1);
});

test("throws ScanError when no routes are found", () => {
  assert.throws(() => scanFilesToIR([{ path: "util.js", content: `export const add = (a,b) => a+b;` }]), ScanError);
});

test("Express: app.use('/api', router) prefixes the router's routes", () => {
  const tools = toolsOf([
    { path: "index.js", content: `const app = express(); app.use('/api', users);` },
    { path: "users.js", content: `users.get('/', list); users.post('/:id', create);` },
  ]);
  assert.ok(tools.has("GET /api"), "router GET '/' -> /api");
  assert.ok(tools.has("POST /api/{id}"), "router POST '/:id' -> /api/{id}");
});

test("Express: nested mounts compose prefixes (app.use -> router.use)", () => {
  const tools = toolsOf([
    { path: "app.js", content: `app.use('/api', v1); v1.use('/users', usersRouter);` },
    { path: "users.js", content: `usersRouter.get('/:id', h);` },
  ]);
  assert.ok(tools.has("GET /api/users/{id}"));
});

test("detectSecurity: JWT/Bearer middleware -> bearer", () => {
  const sec = detectSecurity([{ path: "auth.js", content: `import jwt from 'jsonwebtoken'; jwt.verify(token, secret);` }]);
  assert.equal(sec.type, "bearer");
});

test("detectSecurity: x-api-key header -> apiKey", () => {
  const sec = detectSecurity([{ path: "mw.js", content: `const key = req.headers['x-api-key'];` }]);
  assert.equal(sec.type, "apiKey");
  assert.equal(sec.type === "apiKey" && sec.name, "x-api-key");
  assert.equal(sec.type === "apiKey" && sec.in, "header");
});

test("detectSecurity: FastAPI OAuth2PasswordBearer -> oauth2", () => {
  const sec = detectSecurity([{ path: "deps.py", content: `oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")` }]);
  assert.equal(sec.type, "oauth2");
});

test("detectSecurity: no auth signals -> none", () => {
  const sec = detectSecurity([{ path: "r.js", content: `app.get('/ping', (req,res)=>res.send('ok'));` }]);
  assert.equal(sec.type, "none");
});

test("scanFilesToIR wires detected security into the IR", () => {
  const ir = scanFilesToIR([
    { path: "r.js", content: `app.get('/me', h); // uses passport` },
    { path: "auth.js", content: `passport.authenticate('jwt');` },
  ]);
  assert.equal(ir.security.type, "bearer");
});

test("project name from package.json becomes the IR title", () => {
  const ir = scanFilesToIR([
    { path: "package.json", content: `{"name":"my-api"}` },
    { path: "r.js", content: `app.get('/ping', h);` },
  ]);
  assert.equal(ir.title, "my-api");
});

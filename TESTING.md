# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence. Without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

- **Test runner:** Vitest 4.x
- **Environment:** jsdom
- **Assertion:** Vitest built-in + @testing-library/jest-dom
- **Component testing:** @testing-library/react (when needed)

## Running tests

```bash
npx vitest run          # run all tests once
npx vitest              # watch mode
npx vitest run test/diff-utils.test.ts  # run a specific file
npx vitest run test/api-stream-handler.test.ts test/agent-service-stream.test.ts  # handoff stream regressions
npm run build           # production build sanity check
```

## Test directory

```
test/
├── setup.ts              # Test setup (jest-dom matchers)
├── agent-runtime-status.test.ts
├── agent-service-stream.test.ts
├── api-stream-handler.test.ts
├── blurry-shape.test.ts
├── undo-manager.test.ts  # UndoManager class tests
├── diff-utils.test.ts    # computeHandoffDiff tests
└── *.regression-*.test.ts  # QA regression tests (auto-generated)
```

## Conventions

- File naming: `{module-name}.test.ts` in `test/`
- Regression tests: `{module-name}.regression-{N}.test.ts`
- Use `describe` blocks per module, `it` blocks per behavior
- Mock external dependencies (tldraw editor, store)
- Test real behavior with meaningful assertions, not just "it renders"

## Test layers

- **Unit tests:** Pure logic (undo-manager, diff-utils, paste handler logic)
- **Integration tests:** Stream handler behavior, provider wiring, and component interactions
- **Smoke tests:** Vitest can run basic import/render checks
- **E2E tests:** Browser-based via /qa skill (gstack browse)

## When to write tests

- New functions: write a corresponding test
- Bug fixes: write a regression test
- Error handling: write a test that triggers the error
- Conditionals (if/else, switch): test BOTH paths
- Never commit code that makes existing tests fail

## Handoff stream regression commands

If you touch handoff transport or provider streaming, run:

```bash
npx vitest run test/api-stream-handler.test.ts test/agent-service-stream.test.ts
npx vitest run
npm run build
```

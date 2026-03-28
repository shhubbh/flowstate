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
```

## Test directory

```
test/
├── setup.ts              # Test setup (jest-dom matchers)
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
- **Integration tests:** Component interactions (future, with @testing-library/react)
- **Smoke tests:** Vitest can run basic import/render checks
- **E2E tests:** Browser-based via /qa skill (gstack browse)

## When to write tests

- New functions: write a corresponding test
- Bug fixes: write a regression test
- Error handling: write a test that triggers the error
- Conditionals (if/else, switch): test BOTH paths
- Never commit code that makes existing tests fail

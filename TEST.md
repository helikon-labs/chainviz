<p align="center">
    <img width="600" src="https://raw.githubusercontent.com/helikon-labs/chainviz/development/readme-files/chainviz-logo.png">
</p>

![](https://github.com/helikon-labs/chainviz-v1/actions/workflows/prettier_eslint.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=helikon-labs_chainviz&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=helikon-labs_chainviz)

### Format

To format the code, just run the command `npm run format` at the root source folder, which would also fix the formatting errors. If instead you would like to only view the formatting problems then run `npm run format:check`. Formatting rules are defined inside [.prettierrc](./.prettierrc). Files that are excluded from formatting are defined inside [.prettierignore](./.prettierignore).

### Lint

To run a static check on the code, run `npm run lint` at the root source folder. Lint rules are defined inside [.eslintrc](./.eslintrc), and [.eslintignore](./.eslintignore) defines the files that are excluded from linting.

### Test

To run the tests use the command `npm run test` at the root source folder. Testing code is inside the [tests](./tests) folder. Below is a list of files inside that folder, and the functionality they test.

- [data-store.test.ts](./tests/data-store.test.ts): Tests data store functionality.
- [event-bus.test.ts](./tests/event-bus.test.ts): Tests event bus functionality.
- [format.test.ts](./tests/format.test.ts): Tests formatting utility functions.
- [identicon.test.ts](./tests/identicon.test.ts): Tests Polkadot identicon generator code.
- [object.test.ts](./tests/object.test.ts): Tests deep cloning code for single objects and arrays.
- [rpc-subscription-service.test.ts](./tests/rpc-subscription-service.test.ts): Tests the generic RPC subscription service class functionality, which is used for connecting to SubVT WebSocket services.
- [ui-util.test.ts](./tests/ui-util.test.ts): Test validator display text generator function.

<p align="center">
    <img width="600" src="https://raw.githubusercontent.com/helikon-labs/chainsynth/development/readme_files/chainviz_logo.png">
</p>

![](https://github.com/helikon-labs/chainsynth/actions/workflows/prettier_eslint.yml/badge.svg)

ChainViz ([alpha.chainviz.app](https://alpha.chainviz.app)) is a real-time 3D chain visualization web application for Kusama.

<p align="center">
    <a href="https://alpha.chainviz.app" target="_blank"><img width="100%" src="https://raw.githubusercontent.com/helikon-labs/chainsynth/development/readme_files/screenshot_01.png"></a>
</p>

---

🚧 This project is in heavy progress, and this repo is subject to frequent change.

📱 Chainviz UI is **NOT** optimized / designed for mobile yet, expect a poor mobile experience.

---

Chainviz visualizes the following aspects of the Kusama relay chain and validators in real-time:

-   Active Validators, and the block production and finalization process.
-   Network stats.
    -   Best and finalized blocks.
    -   Era staking data.
-   Active validator list and their activity.
-   Paravalidators, and the assignment of paravalidators to parachains.
-   Validator details panel, where the user can watch the validator in real-time.

Chainviz uses the services provided by the [SubVT backend](https://github.com/helikon-labs/subvt-backend), part of SubVT, a project supported by the Kusama Treasury.

### Build & Run

```
git clone https://github.com/helikon-labs/chainviz.git
cd chainviz
npm ci
npm run dev
```

Chainviz should be running at `localhost:8080`.

Please report any issues to `kutsal [at] helikon.io`.

### Known Issues

`three.js` crashes some versions of (15.x) Safari desktop. It's a known issue and we'll be following the fix. Please see the discussion [here](https://github.com/mrdoob/three.js/issues/22582) for details.

### Tips and Nominations

Tips and nominations are always much welcome!

[Main developer](https://github.com/kukabi)'s account on Kusama: `HMNoSmiwraiEZZV5aAHbxtY24jWSibpkqnazkM9KZmkRi6b`

Kusama validator `🏔 HELIKON 🏔/ISTANBUL`: `GC8fuEZG4E5epGf5KGXtcDfvrc6HXE7GJ5YnbiqSpqdQYLg`
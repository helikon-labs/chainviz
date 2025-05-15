<p align="center">
    <img width="600" src="https://raw.githubusercontent.com/helikon-labs/chainviz/development/readme-files/chainviz-logo.png">
</p>

![](https://github.com/helikon-labs/chainviz-v1/actions/workflows/prettier_eslint.yml/badge.svg)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=helikon-labs_chainviz&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=helikon-labs_chainviz)

[Chainviz](https://chainviz.app) is a real-time 3D chain visualization of the Polkadot machinery.

<p align="center">
    <a href="https://chainviz.app" target="_blank"><img width="100%" src="https://raw.githubusercontent.com/helikon-labs/chainviz/development/readme-files/chainviz-v1-screenshot-01.png"></a>
</p>

You may find the release article on [Medium](https://medium.com/helikon/introducing-chainviz-v1-a-new-kind-of-block-explorer-6b9f4ed83e8d).

[Chainviz](https://chainviz.app) visualizes the following elements of the Polkadot and Kusama relay chains and validators in real-time:

- Active validators in a 3D representation and list format.
- Block production process.
- Block list, and block contents on click.
- Parachains, and their assigned validators.
- Recent XCM transfer messages, and message contents (powered by [Polkaholic API](https://docs.polkaholic.io/#introduction)).
- Basic network and staking data.
- Validator details panel, where the user can observe the validator in real-time.

Chainviz uses the services provided by the [SubVT backend](https://github.com/helikon-labs/subvt-backend/tree/development), part of [SubVT](https://subvt.io), a project supported by the Kusama Treasury and W3F Grants.

Please view the [alpha version](https://alpha.chainviz.app) repository [here](https://github.com/helikon-labs/chainviz).

## Build & Run

### Development

Follow the commands below to run the application in development mode with live code update.

```
git clone https://github.com/helikon-labs/chainviz.git
cd chainviz
npm install
npm run dev
```

Application is going to be available at port `8080`.

### Docker

You can build and run the Docker image locally by running the following commands:

```
git clone https://github.com/helikon-labs/chainviz.git
cd chainviz/docker
docker build -t helikon/chainviz:1.0.1 --no-cache -f ./chainviz.dockerfile ..
docker run --name chainviz -p 8080:8080 -d helikon/chainviz:1.0.1
```

Application is going to be available at port `8080`.

If you'd like to use the existing image from Helikon on Docker Hub, then please use the following commands:

```
docker pull helikon/chainviz:1.0.1
docker run --name chainviz -p 8080:8080 -d helikon/chainviz:1.0.1
```

## Test

Please view [TEST.md](./TEST.md) for testing details.

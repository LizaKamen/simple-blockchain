# About

This repo contains several projects about blockchain

# Run

Clone repo:

```bash
git clone https://github.com/LizaKamen/simple-blockchain.git
cd simple-blockchain
```

## tsonly

Implementation of simple blockchain in typescript

```bash
cd tsonly
```

### Local

```bash
npm install # install dependencies
npm run build # compile ts into js
node dist/index.js # run compiled file
```

### Docker

```bash
docker build -t tsonly .
docker run --name tsonly-container tsonly
docker logs tsonly-container
```

## tsonlypow

Implementation of simple blockchain with proof of work (to add a new block )

```bash
cd tsonlypow
```

### Local

```bash
npm install # install dependencies
npm run build # compile ts into js
node dist/index.js # run compiled file
```

### Docker

```bash
docker build -t tsonlypow .
docker run --name tsonlypow-container tsonlypow
docker logs tsonlypow-container
```

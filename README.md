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

Implementation of simple blockchain with proof of work (to add a new block)

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

## browser

Implementation of simple blockchain with PoW that runs in browser. Also you can run with node. `lib` folder contains blockchain logic.

```bash
cd browser
```

### Local

#### Browser

```bash
npm run compileDeploy
npm start
```

Open your browser at http://localhost:3000/

#### Node

```bash
npm run compileDeploy
node ./dist/node/main.js
```

### Docker

```bash
docker build -t browser .
docker run -p 3000:3000 --name browser-container browser
docker logs browser-container
```

Open your browser at http://localhost:3000/

# clientserver

Implementation using Vite + React on client side and ASP.NET + SignalR on server side

```bash
cd clientbrowser
```

## Docker

```bash
docker-compose up --build
```

Open your browser at http://localhost:3000/

## Local

```bash
# run server
cd server
dotnet run
# run client
cd ..
cd client/reactclient
npm run dev
```

Open your browser at http://localhost:5173/

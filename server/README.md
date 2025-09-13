# RESGS - Real-time Game Server

This project is a real-time game server built with [Colyseus](https://colyseus.io/), a powerful framework for developing multiplayer games and real-time applications in TypeScript/Node.js.

## 📋 Overview

RESGS provides a scalable and robust backend for multiplayer games, handling:
- Real-time communication
- Game state synchronization
- Player matchmaking
- Room management

[Colyseus Documentation](http://docs.colyseus.io/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/resgs.git

# Navigate to the server directory
cd resgs/server

# Install dependencies
npm install
```

### Running the Server
```bash
npm start
```

The server will be running at `http://localhost:2567` by default.

## 🏗️ Project Structure

- `index.ts`: Main entry point that registers room handlers and middleware
- `src/rooms/`: Contains all room implementations
  - `MyRoom.ts`: Sample room implementation
  - Other game room implementations
- `src/rooms/schema/`: Contains all state schemas
  - `MyRoomState.ts`: Sample state schema
  - Other state schemas
- `src/services/`: Utility services and helpers
- `src/types/`: TypeScript type definitions
- `loadtest/`: Load testing scripts
- `config/`: Configuration files

## 🔧 Development Tools

- **Starting the server**: `npm start`
- **Running tests**: `npm test`
- **Load testing**: `npm run loadtest` - Uses the [`@colyseus/loadtest`](https://github.com/colyseus/colyseus-loadtest/) tool with the `loadtest/example.ts` script

## 📝 Configuration

Server configuration can be modified in the `.env` file or through environment variables:

```
PORT=2567
HOST=0.0.0.0
```

## 🔄 Deployment

Instructions for deploying to various platforms:

### Docker
```bash
# Build the Docker image
docker build -t resgs .

# Run the container
docker run -p 2567:2567 resgs
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

import type { Room, CreateRoomPayload, RoomPlayer } from "@/types";

let rooms: Room[] = [
  {
    id: "room-1",
    code: "ABC123",
    theme: "Ciencia",
    rounds: 5,
    maxPlayers: 4,
    isPrivate: false,
    status: "waiting",
    owner: "mock-user-1",
    players: [
      { id: "mock-user-1", name: "Jogador", tag: "#0001", isReady: true },
      { id: "bot-1", name: "CyberBot", tag: "#0042", isReady: false },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "room-2",
    code: "XYZ789",
    theme: "Historia",
    rounds: 10,
    maxPlayers: 2,
    isPrivate: false,
    status: "waiting",
    owner: "bot-2",
    players: [
      { id: "bot-2", name: "NeonPlayer", tag: "#0099", isReady: true },
    ],
    created_at: new Date().toISOString(),
  },
  {
    id: "room-3",
    code: "QWE456",
    theme: "Tecnologia",
    rounds: 3,
    maxPlayers: 6,
    isPrivate: false,
    status: "playing",
    owner: "bot-3",
    players: [
      { id: "bot-3", name: "GlitchMaster", tag: "#0077", isReady: true },
      { id: "bot-4", name: "PixelDust", tag: "#0033", isReady: true },
    ],
    created_at: new Date().toISOString(),
  },
];

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const delay = () => new Promise((r) => setTimeout(r, 300));

export async function mockListRooms(): Promise<Room[]> {
  await delay();
  return rooms.filter((r) => !r.isPrivate && r.status === "waiting");
}

export async function mockCreateRoom(payload: CreateRoomPayload, user: RoomPlayer): Promise<Room> {
  await delay();
  const room: Room = {
    id: `room-${Date.now()}`,
    code: generateCode(),
    theme: payload.theme,
    rounds: payload.rounds,
    maxPlayers: payload.maxPlayers,
    isPrivate: payload.isPrivate,
    status: "waiting",
    owner: user.id,
    players: [
      { ...user, isReady: true },
      { id: "bot-1", name: "CyberBot", tag: "#0042", isReady: true },
    ],
    created_at: new Date().toISOString(),
  };
  rooms = [room, ...rooms];
  return room;
}

export async function mockJoinRoom(roomId: string, user: RoomPlayer): Promise<Room> {
  await delay();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Sala nao encontrada.");
  if (room.status !== "waiting") throw new Error("Partida ja iniciada.");
  if (room.players.length >= room.maxPlayers) throw new Error("Sala cheia.");
  if (room.players.some((p) => p.id === user.id)) return room;
  room.players.push({ ...user, isReady: false });
  return room;
}

export async function mockJoinByCode(code: string, user: RoomPlayer): Promise<Room> {
  await delay();
  const room = rooms.find((r) => r.code === code);
  if (!room) throw new Error("Sala nao encontrada com esse codigo.");
  return mockJoinRoom(room.id, user);
}

export async function mockGetRoom(roomId: string): Promise<Room> {
  await delay();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Sala nao encontrada.");
  return room;
}

export async function mockToggleReady(roomId: string, userId: string): Promise<Room> {
  await delay();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) throw new Error("Sala nao encontrada.");
  const player = room.players.find((p) => p.id === userId);
  if (!player) throw new Error("Jogador nao esta na sala.");
  player.isReady = !player.isReady;
  return room;
}

export async function mockLeaveRoom(roomId: string, userId: string): Promise<void> {
  await delay();
  const room = rooms.find((r) => r.id === roomId);
  if (!room) return;
  room.players = room.players.filter((p) => p.id !== userId);
  if (room.players.length === 0) {
    rooms = rooms.filter((r) => r.id !== roomId);
  } else if (room.owner === userId) {
    room.owner = room.players[0].id;
  }
}

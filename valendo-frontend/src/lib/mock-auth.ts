import type { AuthResponse, LoginCredentials, RegisterCredentials } from "@/types";

const MOCK_EMAIL = process.env.NEXT_PUBLIC_MOCK_EMAIL || "admin@valendo.com";
const MOCK_PASSWORD = process.env.NEXT_PUBLIC_MOCK_PASSWORD || "123456";
const MOCK_USER_NAME = process.env.NEXT_PUBLIC_MOCK_USER_NAME || "Jogador";

function createFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload));
  const sig = btoa("mock-signature");
  return `${header}.${body}.${sig}`;
}

function buildMockResponse(name: string, email: string): AuthResponse {
  const user = {
    id: "mock-user-1",
    name,
    email,
    tag: "#0001",
    created_at: new Date().toISOString(),
  };

  const access_token = createFakeJwt({
    ...user,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24h
  });

  return { access_token, user };
}

export async function mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 500)); // simula latência

  // Guest login
  if (credentials.email === "guest@valendo.app" && credentials.password === "guest123") {
    return buildMockResponse("Convidado", credentials.email);
  }

  if (credentials.email !== MOCK_EMAIL || credentials.password !== MOCK_PASSWORD) {
    throw new Error("Email ou senha inválidos.");
  }

  return buildMockResponse(MOCK_USER_NAME, credentials.email);
}

export async function mockRegister(credentials: RegisterCredentials): Promise<AuthResponse> {
  await new Promise((r) => setTimeout(r, 500));

  return buildMockResponse(credentials.name, credentials.email);
}

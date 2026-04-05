type EventHandler = (data: unknown) => void;

export type SocketStatus = "connected" | "connecting" | "disconnected";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3333/ws";
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 10000];

export class SocketService {
  private ws: WebSocket | null = null;
  private listeners = new Map<string, Set<EventHandler>>();
  private statusListeners = new Set<(status: SocketStatus) => void>();
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private token: string | null = null;
  private _status: SocketStatus = "disconnected";

  get status() {
    return this._status;
  }

  private setStatus(status: SocketStatus) {
    this._status = status;
    this.statusListeners.forEach((fn) => fn(status));
  }

  connect(token: string) {
    this.token = token;
    this.intentionalClose = false;
    this.doConnect();
  }

  private doConnect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    this.setStatus("connecting");

    this.ws = new WebSocket(`${WS_URL}?token=${this.token}`);

    this.ws.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus("connected");
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as { event: string; data: unknown };
        const handlers = this.listeners.get(msg.event);
        if (handlers) {
          handlers.forEach((fn) => fn(msg.data));
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.setStatus("disconnected");
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    const delay = RECONNECT_DELAYS[Math.min(this.reconnectAttempt, RECONNECT_DELAYS.length - 1)];
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.doConnect();
    }, delay);
  }

  disconnect() {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this.setStatus("disconnected");
  }

  send(event: string, data: unknown = {}) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ event, data }));
    }
  }

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  onStatus(handler: (status: SocketStatus) => void) {
    this.statusListeners.add(handler);
    return () => {
      this.statusListeners.delete(handler);
    };
  }

  removeAllListeners() {
    this.listeners.clear();
  }
}

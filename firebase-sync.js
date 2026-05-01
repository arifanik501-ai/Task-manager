/* HisabNikash cloud sync via Firebase Realtime Database.
 *
 * The Firebase Web API key below is NOT a secret — it identifies the
 * Firebase project on the public web. Real access control lives in the
 * Realtime Database rules; see database.rules.json next to this file
 * for the recommended rule set you should paste into the Firebase
 * console (Build → Realtime Database → Rules).
 *
 * Sync model: every device generates a random "Sync ID" stored in
 * localStorage. All state for that device is written to
 * /users/{syncId}/state. To share data across devices, copy the Sync
 * ID from one device and paste it into Settings → Cloud Sync on the
 * other. Last-writer-wins by `lastUpdatedAt` timestamp.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBcjbR7Qu7M-RnHUtLJ9zeehILqQHYLw4E",
  authDomain: "whatsapp-c10ef.firebaseapp.com",
  databaseURL: "https://whatsapp-c10ef-default-rtdb.firebaseio.com",
  projectId: "whatsapp-c10ef",
  storageBucket: "whatsapp-c10ef.firebasestorage.app",
  messagingSenderId: "675053106773",
  appId: "1:675053106773:web:b7078468691a07ecfec6dc",
  measurementId: "G-89Z8WBJ3R0"
};

const DEVICE_KEY = "hisabnikash_device_id";
const PATH_PREFIX = "users";
const PUSH_DEBOUNCE_MS = 600;

const sessionId = newId("s");
const statusListeners = new Set();
const remoteListeners = new Set();
let app;
let db;
let currentDeviceId;
let currentRef;
let unsubscribe;
let pushTimer = null;
let pendingPush = null;
let lastRemoteSnapshot = null;
let status = "connecting";

function newId(prefix = "d") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return prefix + "-" + crypto.randomUUID();
  return prefix + "-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getStoredDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = newId("d");
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function setStatus(next) {
  if (status === next) return;
  status = next;
  statusListeners.forEach((fn) => {
    try { fn(next); } catch (error) { console.warn("[cloud] status listener error", error); }
  });
  window.dispatchEvent(new CustomEvent("cloud-status-change", { detail: next }));
}

function emitRemote(value) {
  lastRemoteSnapshot = value;
  remoteListeners.forEach((fn) => {
    try { fn(value); } catch (error) { console.warn("[cloud] remote listener error", error); }
  });
  window.dispatchEvent(new CustomEvent("cloud-state-update", { detail: value }));
}

function attachListener() {
  if (unsubscribe) {
    try { unsubscribe(); } catch { /* noop */ }
    unsubscribe = null;
  }
  currentRef = ref(db, `${PATH_PREFIX}/${currentDeviceId}/state`);
  unsubscribe = onValue(
    currentRef,
    (snapshot) => {
      const value = snapshot.exists() ? snapshot.val() : null;
      // Skip echoes of our own writes (same browser tab session).
      if (value && value._origin === sessionId) {
        if (status !== "online") setStatus("online");
        return;
      }
      setStatus("online");
      emitRemote(value);
    },
    (error) => {
      console.warn("[cloud] subscribe error", error);
      setStatus("error");
    }
  );
}

async function init() {
  try {
    app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    currentDeviceId = getStoredDeviceId();
    attachListener();
    const snapshot = await get(currentRef);
    const value = snapshot.exists() ? snapshot.val() : null;
    lastRemoteSnapshot = value;
    setStatus("online");
    return value;
  } catch (error) {
    console.warn("[cloud] init error", error);
    setStatus("error");
    return null;
  }
}

const readyPromise = init();

function flushPush() {
  pushTimer = null;
  if (!pendingPush || !currentRef) return;
  const stateToPush = pendingPush;
  pendingPush = null;
  setStatus("syncing");
  const payload = {
    ...stateToPush,
    _origin: sessionId,
    _updatedAt: Date.now()
  };
  set(currentRef, payload)
    .then(() => setStatus("online"))
    .catch((error) => {
      console.warn("[cloud] write error", error);
      setStatus("error");
    });
}

function push(stateObj) {
  if (!stateObj || typeof stateObj !== "object") return;
  pendingPush = stateObj;
  if (pushTimer) return;
  pushTimer = setTimeout(flushPush, PUSH_DEBOUNCE_MS);
}

async function setDeviceId(rawId) {
  const id = String(rawId || "").trim();
  if (!id) return false;
  if (id === currentDeviceId) return true;
  localStorage.setItem(DEVICE_KEY, id);
  currentDeviceId = id;
  setStatus("connecting");
  attachListener();
  try {
    const snapshot = await get(currentRef);
    const value = snapshot.exists() ? snapshot.val() : null;
    setStatus("online");
    emitRemote(value);
    return true;
  } catch (error) {
    console.warn("[cloud] setDeviceId error", error);
    setStatus("error");
    return false;
  }
}

window.cloudSync = {
  ready: readyPromise,
  push,
  status: () => status,
  getDeviceId: () => currentDeviceId,
  setDeviceId,
  onStatusChange(fn) { statusListeners.add(fn); return () => statusListeners.delete(fn); },
  onRemoteUpdate(fn) { remoteListeners.add(fn); return () => remoteListeners.delete(fn); },
  getLastRemote: () => lastRemoteSnapshot
};

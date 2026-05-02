/* হিসাব cloud sync via Firebase Realtime Database.
 *
 * Single shared bucket: every device reads from and writes to
 * /shared/state. There is no per-device ID anymore; whoever opens the
 * app sees and edits the same data.
 *
 * The Firebase Web API key below is NOT a secret — it identifies the
 * Firebase project on the public web. Real access control lives in the
 * Realtime Database rules; see database.rules.json next to this file
 * for the recommended rule set you should paste into the Firebase
 * console (Build → Realtime Database → Rules).
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

const SHARED_PATH = "shared/state";
const PUSH_DEBOUNCE_MS = 120;

const sessionId = newSessionId();
const statusListeners = new Set();
const remoteListeners = new Set();
let app;
let db;
let sharedRef;
let unsubscribe;
let pushTimer = null;
let pendingPush = null;
let lastRemoteSnapshot = null;
let status = "offline";

function newSessionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return "s-" + crypto.randomUUID();
  return "s-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
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
  sharedRef = ref(db, SHARED_PATH);
  unsubscribe = onValue(
    sharedRef,
    (snapshot) => {
      const value = snapshot.exists() ? snapshot.val() : null;
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
    attachListener();
    const snapshot = await get(sharedRef);
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
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  if (!pendingPush || !sharedRef) return Promise.resolve(false);
  const stateToPush = pendingPush;
  pendingPush = null;
  const payload = {
    ...stateToPush,
    _origin: sessionId,
    _updatedAt: Date.now()
  };
  return set(sharedRef, payload)
    .then(() => { setStatus("online"); return true; })
    .catch((error) => {
      console.warn("[cloud] write error", error);
      setStatus("error");
      throw error;
    });
}

function push(stateObj) {
  if (!stateObj || typeof stateObj !== "object") return;
  pendingPush = stateObj;
  if (pushTimer) return;
  pushTimer = setTimeout(flushPush, PUSH_DEBOUNCE_MS);
}

function cancelPending() {
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  pendingPush = null;
}

function pushNow(stateObj) {
  if (stateObj && typeof stateObj === "object") pendingPush = stateObj;
  return flushPush();
}

async function pullNow() {
  if (!sharedRef) return null;
  try {
    const snapshot = await get(sharedRef);
    const value = snapshot.exists() ? snapshot.val() : null;
    setStatus("online");
    if (value && value._origin !== sessionId) {
      emitRemote(value);
    } else {
      lastRemoteSnapshot = value;
    }
    return value;
  } catch (error) {
    console.warn("[cloud] pull error", error);
    setStatus("error");
    throw error;
  }
}

async function syncNow(stateObj) {
  try { await pushNow(stateObj); } catch { /* surfaced via status */ }
  return pullNow();
}

window.cloudSync = {
  ready: readyPromise,
  push,
  pushNow,
  pullNow,
  syncNow,
  cancelPending,
  status: () => status,
  onStatusChange(fn) { statusListeners.add(fn); return () => statusListeners.delete(fn); },
  onRemoteUpdate(fn) { remoteListeners.add(fn); return () => remoteListeners.delete(fn); },
  getLastRemote: () => lastRemoteSnapshot
};

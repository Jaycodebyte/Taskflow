export function useLocalStore() {
  return !process.env.DATABASE_URL && process.env.NODE_ENV !== "production";
}

export function getLocalProjects() {
  globalThis.__taskflowLocalProjects ||= [];
  return globalThis.__taskflowLocalProjects;
}

export function getLocalTasks() {
  globalThis.__taskflowLocalTasks ||= [];
  return globalThis.__taskflowLocalTasks;
}

export function getLocalUsers() {
  globalThis.__taskflowLocalUsers ||= new Map();
  return globalThis.__taskflowLocalUsers;
}

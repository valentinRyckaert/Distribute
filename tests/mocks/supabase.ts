/*
 * Fake Supabase client: every query builder method is chainable and recorded, and awaiting a
 * query resolves to the next response queued with `queueResponse` (or `{ data: null, error: null }`).
 */

type Response = { data?: unknown; error?: unknown; count?: number }

const responses: Response[] = []
export const calls: unknown[][] = []

/** Queues the result of the next awaited query, in order. */
export function queueResponse(...next: Response[]): void {
  responses.push(...next)
}

/** Forgets queued responses and recorded calls. */
export function resetSupabase(): void {
  responses.length = 0
  calls.length = 0
}

function query(start: string, ...args: unknown[]): unknown {
  calls.push([start, ...args])
  const proxy: unknown = new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') {
          const response = { data: null, error: null, ...responses.shift() }
          return (resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) =>
            Promise.resolve(response).then(resolve, reject)
        }
        return (...methodArgs: unknown[]) => {
          calls.push([String(prop), ...methodArgs])
          return proxy
        }
      },
    },
  )
  return proxy
}

export const supabase = {
  from: jest.fn((table: string) => query('from', table)),
  rpc: jest.fn((name: string, args: unknown) => query('rpc', name, args)),
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(async () => ({ data: { session: null } })),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    signInWithPassword: jest.fn(async () => ({ error: null })),
    signOut: jest.fn(async () => ({ error: null })),
    resetPasswordForEmail: jest.fn(async () => ({ error: null })),
    verifyOtp: jest.fn(async () => ({ error: null })),
    updateUser: jest.fn(async () => ({ error: null })),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(async () => ({ error: null })),
      createSignedUrl: jest.fn(async () => ({
        data: { signedUrl: 'https://signed/url' },
        error: null,
      })),
    })),
  },
}

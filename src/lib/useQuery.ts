import { useFocusEffect } from 'expo-router'
import { useCallback, useRef, useState } from 'react'
import { friendlyError } from './errors'

/** State of data loaded from the API. */
export interface QueryState<T> {
  data: T | undefined
  error: string | null
  loading: boolean
  reload: () => void
}

/**
 * Loads data each time the screen gets the focus, so it is fresh after coming back to it.
 * @param load the API call; it is re-run when `deps` change
 */
export function useQuery<T>(load: () => Promise<T>, deps: unknown[] = []): QueryState<T> {
  const key = JSON.stringify(deps)
  const [data, setData] = useState<T>()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const latest = useRef(0)

  const reload = useCallback(() => {
    const call = ++latest.current
    setLoading(true)
    load()
      .then((result) => {
        if (call !== latest.current) return // a newer load started meanwhile
        setData(result)
        setError(null)
      })
      .catch((err: unknown) => call === latest.current && setError(friendlyError(err)))
      .finally(() => call === latest.current && setLoading(false))
    // `load` is a new closure at each render; `key` captures what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useFocusEffect(reload)
  return { data, error, loading, reload }
}

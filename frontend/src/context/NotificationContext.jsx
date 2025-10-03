import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'

// IST helper (+05:30)
const IST_OFFSET_MIN = 5 * 60 + 30
const toISTDate = (date) => {
  // Convert a Date to IST by adjusting minutes
  const d = new Date(date)
  const utc = d.getTime() + d.getTimezoneOffset() * 60000
  return new Date(utc + IST_OFFSET_MIN * 60000)
}

const fromISTToLocal = (istDate) => {
  const d = new Date(istDate)
  // istDate is in IST; convert to local by subtracting IST offset then adding local offset
  const utc = d.getTime() - IST_OFFSET_MIN * 60000
  return new Date(utc)
}

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]) // {id, title, body, type, createdAt, read}
  const [reminders, setReminders] = useState([]) // {id, itemId, title, whenISTISO, fired}
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [desktopEnabled, setDesktopEnabled] = useState(() => {
    const v = localStorage.getItem('notif_desktop_enabled')
    return v === null ? true : v === 'true'
  })
  const timersRef = useRef(new Map())

  // Request desktop permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('notif_desktop_enabled', String(desktopEnabled))
  }, [desktopEnabled])

  const addNotification = ({ title, body, type = 'info' }) => {
    const n = { id: crypto.randomUUID(), title, body, type, createdAt: new Date().toISOString(), read: false }
    setNotifications((prev) => [n, ...prev])
    // Desktop notification
    if (desktopEnabled && 'Notification' in window && Notification.permission === 'granted') {
      // eslint-disable-next-line no-new
      new Notification(title, { body })
    }
    return n.id
  }

  const markRead = (id) => setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const markAllRead = () => setNotifications((prev) => prev.map(n => ({ ...n, read: true })))

  // Schedule reminder with IST timestamp string or Date
  const scheduleReminder = ({ itemId, title, whenIST }) => {
    const whenISTDate = whenIST instanceof Date ? whenIST : new Date(whenIST)
    const localFireDate = fromISTToLocal(whenISTDate) // fire according to IST time
    const id = crypto.randomUUID()
    const r = { id, itemId, title, whenISTISO: whenISTDate.toISOString(), fired: false }
    setReminders((prev) => [...prev, r])

    const delay = Math.max(0, localFireDate.getTime() - Date.now())
    const t = setTimeout(() => {
      addNotification({ title: 'Grocery Reminder', body: title, type: 'reminder' })
      setReminders((prev) => prev.map(x => x.id === id ? { ...x, fired: true } : x))
    }, delay)
    timersRef.current.set(id, t)
    return id
  }

  const cancelReminder = (id) => {
    const t = timersRef.current.get(id)
    if (t) clearTimeout(t)
    timersRef.current.delete(id)
    setReminders((prev) => prev.filter(r => r.id !== id))
  }

  useEffect(() => () => {
    // cleanup timers on unmount
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current.clear()
  }, [])

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications])

  const value = {
    notifications,
    reminders,
    unreadCount,
    drawerOpen,
    setDrawerOpen,
    desktopEnabled,
    setDesktopEnabled,
    addNotification,
    scheduleReminder,
    cancelReminder,
    markRead,
    markAllRead,
    toISTDate,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)

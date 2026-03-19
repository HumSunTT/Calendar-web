const Storage = {
  EVENTS_KEY: 'calendar_events',
  HOLIDAY_CACHE_KEY: 'calendar_holiday_cache',
  THEME_KEY: 'calendar_theme',
  BG_KEY: 'calendar_background',

  getEvents() {
    try {
      const data = localStorage.getItem(this.EVENTS_KEY)
      return data ? JSON.parse(data) : []
    } catch (e) {
      console.error('Failed to read events:', e)
      return []
    }
  },

  saveEvents(events) {
    try {
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(events))
      return true
    } catch (e) {
      console.error('Failed to save events:', e)
      return false
    }
  },

  addEvent(event) {
    const events = this.getEvents()
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: Date.now()
    }
    events.push(newEvent)
    this.saveEvents(events)
    return newEvent
  },

  updateEvent(id, updates) {
    const events = this.getEvents()
    const index = events.findIndex(e => e.id === id)
    if (index !== -1) {
      events[index] = { ...events[index], ...updates, updatedAt: Date.now() }
      this.saveEvents(events)
      return events[index]
    }
    return null
  },

  deleteEvent(id) {
    const events = this.getEvents().filter(e => e.id !== id)
    this.saveEvents(events)
    return events
  },

  getEventsByDate(date) {
    return this.getEvents().filter(e => e.date === date)
  },

  getHolidayCache() {
    try {
      const data = localStorage.getItem(this.HOLIDAY_CACHE_KEY)
      if (!data) return null
      const cache = JSON.parse(data)
      const currentYear = new Date().getFullYear()
      if (cache.year === currentYear) {
        return cache
      }
      if (Date.now() > cache.expiry) {
        localStorage.removeItem(this.HOLIDAY_CACHE_KEY)
        return null
      }
      return cache
    } catch (e) {
      return null
    }
  },

  setHolidayCache(year, data) {
    const currentYear = new Date().getFullYear()
    let expiry
    if (year === currentYear) {
      expiry = new Date(currentYear, 11, 31, 23, 59, 59).getTime()
    } else {
      expiry = Date.now() + 30 * 24 * 60 * 60 * 1000
    }
    const cache = {
      year,
      data,
      expiry,
      fetchedAt: Date.now()
    }
    localStorage.setItem(this.HOLIDAY_CACHE_KEY, JSON.stringify(cache))
  },

  getAllHolidayCache() {
    try {
      const result = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('calendar_holiday_') && key !== this.HOLIDAY_CACHE_KEY) {
          const year = parseInt(key.replace('calendar_holiday_', ''))
          const data = localStorage.getItem(key)
          if (data) {
            result[year] = JSON.parse(data)
          }
        }
      }
      const mainCache = this.getHolidayCache()
      if (mainCache) {
        result[mainCache.year] = mainCache
      }
      return result
    } catch (e) {
      return {}
    }
  },

  setYearHolidayCache(year, data) {
    const key = 'calendar_holiday_' + year
    const currentYear = new Date().getFullYear()
    let expiry
    if (year === currentYear) {
      expiry = new Date(currentYear, 11, 31, 23, 59, 59).getTime()
    } else {
      expiry = Date.now() + 30 * 24 * 60 * 60 * 1000
    }
    const cache = {
      year,
      data,
      expiry,
      fetchedAt: Date.now()
    }
    localStorage.setItem(key, JSON.stringify(cache))
  },

  getYearHolidayCache(year) {
    try {
      const key = 'calendar_holiday_' + year
      const data = localStorage.getItem(key)
      if (!data) return null
      const cache = JSON.parse(data)
      if (Date.now() > cache.expiry) {
        localStorage.removeItem(key)
        return null
      }
      return cache
    } catch (e) {
      return null
    }
  },

  clearAll() {
    localStorage.removeItem(this.EVENTS_KEY)
    localStorage.removeItem(this.HOLIDAY_CACHE_KEY)
  },

  getTheme() {
    return localStorage.getItem(this.THEME_KEY) || 'default'
  },

  setTheme(theme) {
    localStorage.setItem(this.THEME_KEY, theme)
  },

  getBackground() {
    try {
      const data = localStorage.getItem(this.BG_KEY)
      return data ? JSON.parse(data) : null
    } catch (e) {
      return null
    }
  },

  setBackground(data) {
    try {
      localStorage.setItem(this.BG_KEY, JSON.stringify(data))
      return true
    } catch (e) {
      return false
    }
  },

  clearBackground() {
    localStorage.removeItem(this.BG_KEY)
  }
}

window.Storage = Storage
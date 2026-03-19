const HolidayService = {
  API_BASE: 'https://timor.tech/api/holiday',
  CDN_BASE: 'https://cdn.jsdelivr.net/gh/NateScarlet/holiday-cn@master',
  yearData: {},
  fetchedYears: new Set(),

  async getHolidayInfo(date) {
    const [year] = date.split('-')
    const yearNum = parseInt(year)
    
    if (!this.fetchedYears.has(yearNum)) {
      await this.prefetchYear(yearNum)
    }
    
    return this.getInfoFromCache(date)
  },

  async prefetchYear(year) {
    if (this.fetchedYears.has(year)) return
    if (this.yearData[year]) return

    const currentYear = new Date().getFullYear()
    
    if (year > currentYear) {
      console.log(year, '年为未来年份，法定假期尚未发布，使用离线模式')
      this.fetchedYears.add(year)
      return
    }

    const cached = Storage.getYearHolidayCache(year)
    if (cached && cached.data) {
      this.yearData[year] = cached.data
      this.fetchedYears.add(year)
      console.log('节假日数据从缓存加载:', year, '年')
      return
    }

    console.log('正在获取', year, '年节假日数据...')
    
    let data = await this.fetchFromAPI(year)
    let source = 'API'
    
    if (!data) {
      data = await this.fetchFromCDN(year)
      source = 'CDN'
    }

    if (data) {
      this.yearData[year] = data
      this.fetchedYears.add(year)
      Storage.setYearHolidayCache(year, data)
      console.log(year, '年节假日数据获取成功，来源:', source)
    } else {
      console.warn(year, '年节假日数据获取失败，使用离线模式')
      this.fetchedYears.add(year)
    }
  },

  async fetchFromAPI(year) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(
        `${this.API_BASE}/year/${year}/?type=Y&week=Y`,
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) return null
      
      const data = await response.json()
      return data.code === 0 ? data : null
    } catch (e) {
      console.warn('API获取失败:', e.message)
      return null
    }
  },

  async fetchFromCDN(year) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000)
      
      const response = await fetch(
        `${this.CDN_BASE}/${year}.json`,
        { signal: controller.signal }
      )
      
      clearTimeout(timeoutId)
      
      if (!response.ok) return null
      
      const data = await response.json()
      return this.transformCDNData(data)
    } catch (e) {
      console.warn('CDN获取失败:', e.message)
      return null
    }
  },

  transformCDNData(data) {
    const result = { type: {}, holiday: {} }
    
    data.days.forEach(day => {
      const date = day.date
      const dayOfWeek = new Date(date).getDay()
      
      if (day.isOffDay) {
        result.holiday[date] = {
          holiday: true,
          name: day.name,
          wage: 2
        }
        result.type[date] = {
          type: 2,
          name: day.name,
          week: dayOfWeek === 0 ? 7 : dayOfWeek
        }
      } else {
        result.type[date] = {
          type: 3,
          name: `${day.name}调休`,
          week: dayOfWeek === 0 ? 7 : dayOfWeek
        }
      }
    })
    
    return result
  },

  getInfoFromCache(date) {
    const [year] = date.split('-')
    const yearData = this.yearData[parseInt(year)]
    
    if (!yearData) {
      return this.getOfflineInfo(date)
    }

    const typeInfo = yearData.type?.[date]
    const holidayInfo = yearData.holiday?.[date]

    if (typeInfo) {
      return {
        type: typeInfo.type,
        name: typeInfo.name,
        week: typeInfo.week,
        isHoliday: typeInfo.type === 2,
        isWorkday: typeInfo.type === 0 || typeInfo.type === 3,
        isWeekend: typeInfo.type === 1,
        isAdjust: typeInfo.type === 3,
        holidayName: holidayInfo?.name || null,
        source: 'online'
      }
    }

    return this.getOfflineInfo(date)
  },

  getOfflineInfo(date) {
    const [y, m, d] = date.split('-').map(Number)
    const dayOfWeek = new Date(date).getDay()
    const week = dayOfWeek === 0 ? 7 : dayOfWeek

    if (typeof HolidayUtil !== 'undefined') {
      const holiday = HolidayUtil.getHoliday(y, m, d)
      if (holiday) {
        return {
          type: holiday.isWork() ? 3 : 2,
          name: holiday.getName(),
          week,
          isHoliday: !holiday.isWork(),
          isWorkday: holiday.isWork(),
          isWeekend: false,
          isAdjust: holiday.isWork(),
          holidayName: holiday.getName(),
          source: 'offline'
        }
      }
    }

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    return {
      type: isWeekend ? 1 : 0,
      name: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'][week - 1],
      week,
      isHoliday: false,
      isWorkday: !isWeekend,
      isWeekend,
      isAdjust: false,
      holidayName: null,
      source: 'offline'
    }
  },

  getDataSourceInfo(year) {
    const cache = Storage.getYearHolidayCache(year)
    if (cache) {
      return {
        cached: true,
        fetchedAt: new Date(cache.fetchedAt).toLocaleString('zh-CN'),
        source: cache.source || 'online'
      }
    }
    return {
      cached: false,
      fetchedAt: null,
      source: 'offline'
    }
  }
}

window.HolidayService = HolidayService
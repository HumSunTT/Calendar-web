const LunarService = {
  getLunarInfo(year, month, day) {
    if (typeof Solar === 'undefined') {
      return this.getFallbackInfo(day)
    }

    try {
      const solar = Solar.fromYmd(year, month, day)
      const lunar = solar.getLunar()
      
      const lunarMonth = lunar.getMonthInChinese()
      const lunarDay = lunar.getDayInChinese()
      const jieQi = lunar.getJieQi()
      const festivals = lunar.getFestivals()
      const solarFestivals = solar.getFestivals()

      const lunarFestival = festivals.length > 0 ? festivals[0] : null
      const solarFestival = solarFestivals.length > 0 ? solarFestivals[0] : null

      let displayText = lunarDay
      
      if (lunarDay === '初一') {
        displayText = lunarMonth
      }

      return {
        lunarMonth,
        lunarDay,
        displayText,
        jieQi: jieQi || null,
        lunarFestival,
        solarFestival,
        yearGanZhi: lunar.getYearInGanZhi(),
        yearShengXiao: lunar.getYearShengXiao(),
        monthGanZhi: lunar.getMonthInGanZhi(),
        dayGanZhi: lunar.getDayInGanZhi()
      }
    } catch (e) {
      console.error('Lunar calculation error:', e)
      return this.getFallbackInfo(day)
    }
  },

  getFallbackInfo(day) {
    const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                       '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                       '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
    return {
      lunarMonth: '',
      lunarDay: lunarDays[day - 1] || '',
      displayText: lunarDays[day - 1] || '',
      jieQi: null,
      lunarFestival: null,
      solarFestival: null,
      yearGanZhi: '',
      yearShengXiao: '',
      monthGanZhi: '',
      dayGanZhi: ''
    }
  },

  formatLunarDate(year, month, day) {
    const info = this.getLunarInfo(year, month, day)
    const parts = []
    
    if (info.yearGanZhi) {
      parts.push(info.yearGanZhi + '年')
    }
    if (info.yearShengXiao) {
      parts.push('(' + info.yearShengXiao + '年)')
    }
    if (info.lunarMonth) {
      parts.push(info.lunarMonth)
    }
    if (info.lunarDay) {
      parts.push(info.lunarDay)
    }
    
    return parts.join(' ')
  },

  getMonthDays(year, month) {
    return new Date(year, month, 0).getDate()
  },

  getFirstDayOfMonth(year, month) {
    return new Date(year, month - 1, 1).getDay()
  }
}

window.LunarService = LunarService
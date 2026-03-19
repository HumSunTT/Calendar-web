const Calendar = {
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth() + 1,
  currentView: 'month',

  init() {
    this.grid = document.getElementById('calendarGrid')
    this.yearContainer = document.getElementById('yearView')
    this.yearInput = document.getElementById('yearInput')
    this.initYearInput()
    this.render()
  },

  initYearInput() {
    if (this.yearInput) {
      this.yearInput.value = this.currentYear
      
      const self = this
      this.yearInput.addEventListener('change', function() {
        let year = parseInt(this.value)
        if (isNaN(year) || year < 1) {
          year = 1
        } else if (year > 9999) {
          year = 9999
        }
        self.currentYear = year
        this.value = year
        self.render()
      })

      this.yearInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          this.blur()
        }
      })
    }
  },

  updateYearInput() {
    if (this.yearInput) {
      this.yearInput.value = this.currentYear
    }
  },

  setView(view) {
    this.currentView = view
    this.render()
  },

  setYearMonth(year, month) {
    this.currentYear = year
    this.currentMonth = month
    this.updateYearInput()
    this.render()
  },

  prev() {
    if (this.currentView === 'year') {
      this.currentYear = Math.max(1, this.currentYear - 1)
    } else {
      if (this.currentMonth === 1) {
        this.currentYear = Math.max(1, this.currentYear - 1)
        this.currentMonth = 12
      } else {
        this.currentMonth--
      }
    }
    this.updateYearInput()
    this.render()
  },

  next() {
    if (this.currentView === 'year') {
      this.currentYear = Math.min(9999, this.currentYear + 1)
    } else {
      if (this.currentMonth === 12) {
        this.currentYear = Math.min(9999, this.currentYear + 1)
        this.currentMonth = 1
      } else {
        this.currentMonth++
      }
    }
    this.updateYearInput()
    this.render()
  },

  goToToday() {
    const today = new Date()
    this.currentYear = today.getFullYear()
    this.currentMonth = today.getMonth() + 1
    this.render()
  },

  async render() {
    this.updateHeader()

    if (this.currentView === 'year') {
      await this.renderYearView()
    } else {
      await this.renderMonthView()
    }
  },

  async renderMonthView() {
    document.getElementById('monthView').style.display = 'block'
    document.getElementById('yearView').style.display = 'none'

    await HolidayService.prefetchYear(this.currentYear)

    const firstDay = LunarService.getFirstDayOfMonth(this.currentYear, this.currentMonth)
    const daysInMonth = LunarService.getMonthDays(this.currentYear, this.currentMonth)
    const daysInPrevMonth = LunarService.getMonthDays(
      this.currentMonth === 1 ? this.currentYear - 1 : this.currentYear,
      this.currentMonth === 1 ? 12 : this.currentMonth - 1
    )

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const prevMonthDays = firstDay
    const totalCells = Math.ceil((prevMonthDays + daysInMonth) / 7) * 7
    const nextMonthDays = totalCells - prevMonthDays - daysInMonth

    let html = ''

    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const month = this.currentMonth === 1 ? 12 : this.currentMonth - 1
      const year = this.currentMonth === 1 ? this.currentYear - 1 : this.currentYear
      html += this.renderDayCell(year, month, day, true, todayStr)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      html += this.renderDayCell(this.currentYear, this.currentMonth, day, false, todayStr)
    }

    for (let day = 1; day <= nextMonthDays; day++) {
      const month = this.currentMonth === 12 ? 1 : this.currentMonth + 1
      const year = this.currentMonth === 12 ? this.currentYear + 1 : this.currentYear
      html += this.renderDayCell(year, month, day, true, todayStr)
    }

    this.grid.innerHTML = html
    this.attachClickHandlers()
  },

  renderDayCell(year, month, day, isOtherMonth, todayStr) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const holidayInfo = HolidayService.getInfoFromCache(dateStr)
    const lunarInfo = LunarService.getLunarInfo(year, month, day)
    const events = EventManager.getByDate(dateStr)

    const isToday = dateStr === todayStr
    const classes = ['day-cell']
    if (isOtherMonth) classes.push('other-month')
    if (isToday) classes.push('today')

    let badgeHtml = ''

    if (holidayInfo) {
      if (holidayInfo.isHoliday) {
        badgeHtml = '<span class="day-type-badge badge-holiday">休</span>'
        classes.push('holiday-cell')
      } else if (holidayInfo.isAdjust) {
        badgeHtml = '<span class="day-type-badge badge-workday">班</span>'
      } else if (holidayInfo.isWeekend) {
        badgeHtml = '<span class="day-type-badge badge-weekend">休</span>'
        classes.push('weekend-cell')
      }
    }

    let specialText = ''
    if (lunarInfo.jieQi) {
      specialText = '<div class="jieqi">' + lunarInfo.jieQi + '</div>'
    } else if (holidayInfo && holidayInfo.isHoliday && holidayInfo.holidayName) {
      specialText = '<div class="holiday-name">' + holidayInfo.holidayName + '</div>'
    } else if (lunarInfo.lunarFestival) {
      specialText = '<div class="holiday-name">' + lunarInfo.lunarFestival + '</div>'
    } else if (lunarInfo.solarFestival) {
      specialText = '<div class="holiday-name">' + lunarInfo.solarFestival + '</div>'
    }

    let eventHtml = ''
    if (events.length > 0) {
      if (events.length <= 2) {
        eventHtml = events.map(function(e) {
          return '<div class="event-preview">' + (e.time || '') + ' ' + e.title + '</div>'
        }).join('')
      } else {
        eventHtml = '<div class="event-preview">' + (events[0].time || '') + ' ' + events[0].title + '</div>'
        eventHtml += '<div style="font-size: 12px; color: #8b5cf6; margin-top: 4px;">+' + (events.length - 1) + ' 更多</div>'
      }
    }

    return '<div class="' + classes.join(' ') + '" data-date="' + dateStr + '">' +
      '<div class="day-header">' +
        '<span class="solar-day">' + day + '</span>' +
        badgeHtml +
      '</div>' +
      '<div class="lunar-day">' + lunarInfo.displayText + '</div>' +
      specialText +
      eventHtml +
    '</div>'
  },

  async renderYearView() {
    document.getElementById('monthView').style.display = 'none'
    document.getElementById('yearView').style.display = 'grid'

    await HolidayService.prefetchYear(this.currentYear)

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    let html = ''
    for (let month = 1; month <= 12; month++) {
      html += this.renderMonthCard(this.currentYear, month, todayStr)
    }

    this.yearContainer.innerHTML = html
    this.attachMonthCardClickHandlers()
  },

  renderMonthCard(year, month, todayStr) {
    const firstDay = LunarService.getFirstDayOfMonth(year, month)
    const daysInMonth = LunarService.getMonthDays(year, month)
    const daysInPrevMonth = LunarService.getMonthDays(
      month === 1 ? year - 1 : year,
      month === 1 ? 12 : month - 1
    )

    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月',
                        '七月', '八月', '九月', '十月', '十一月', '十二月']

    const weekDays = ['日', '一', '二', '三', '四', '五', '六']

    let daysHtml = ''

    for (let i = 0; i < 7; i++) {
      const isWeekend = i === 0 || i === 6
      daysHtml += '<div class="month-weekday' + (isWeekend ? ' weekend' : '') + '">' + weekDays[i] + '</div>'
    }

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      daysHtml += '<div class="month-day-cell other-month">' + day + '</div>'
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = year + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0')
      const holidayInfo = HolidayService.getInfoFromCache(dateStr)
      const events = EventManager.getByDate(dateStr)

      let classes = ['month-day-cell']
      if (dateStr === todayStr) classes.push('today')
      if (holidayInfo && holidayInfo.isHoliday) classes.push('holiday')
      if (holidayInfo && holidayInfo.isWeekend && !holidayInfo.isHoliday) classes.push('weekend')
      if (events.length > 0) classes.push('has-event')

      daysHtml += '<div class="' + classes.join(' ') + '" data-date="' + dateStr + '">' + day + '</div>'
    }

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
    const nextMonthDays = totalCells - firstDay - daysInMonth

    for (let day = 1; day <= nextMonthDays; day++) {
      daysHtml += '<div class="month-day-cell other-month">' + day + '</div>'
    }

    return '<div class="month-card" data-month="' + month + '">' +
      '<div class="month-header">' + monthNames[month - 1] + '</div>' +
      '<div class="month-grid">' + daysHtml + '</div>' +
    '</div>'
  },

  getZodiacIcon(shengxiao) {
    const zodiacMap = {
      '鼠': '🐭',
      '牛': '🐮',
      '虎': '🐯',
      '兔': '🐰',
      '龙': '🐲',
      '蛇': '🐍',
      '马': '🐴',
      '羊': '🐑',
      '猴': '🐵',
      '鸡': '🐔',
      '狗': '🐶',
      '猪': '🐷'
    }
    return zodiacMap[shengxiao] || ''
  },

  updateHeader() {
    if (this.yearSelect) {
      this.yearSelect.value = this.currentYear
    }

    const lunarInfo = LunarService.getLunarInfo(this.currentYear, this.currentMonth, 1)
    const lunarYearText = document.getElementById('lunarYearText')
    if (lunarYearText) {
      const ganZhi = lunarInfo.yearGanZhi
      const shengxiao = lunarInfo.yearShengXiao
      const zodiacIcon = this.getZodiacIcon(shengxiao)
      lunarYearText.innerHTML = '<span class="lunar-year"><span class="gan-zhi">' + ganZhi + '年</span>（<span class="sheng-xiao">' + shengxiao + '</span>）<span class="zodiac-icon">' + zodiacIcon + '</span></span>'
    }

    if (this.currentView === 'year') {
      document.getElementById('yearSuffix').style.display = 'inline'
      document.getElementById('currentMonth').style.display = 'none'
      document.getElementById('monthSuffix').style.display = 'none'
    } else {
      document.getElementById('yearSuffix').style.display = 'inline'
      document.getElementById('currentMonth').style.display = 'inline'
      document.getElementById('monthSuffix').style.display = 'inline'
      document.getElementById('currentMonth').textContent = this.currentMonth
    }
  },

  attachClickHandlers() {
    const self = this
    this.grid.querySelectorAll('.day-cell').forEach(function(cell) {
      cell.addEventListener('click', function() {
        const date = this.dataset.date
        App.openModal(date)
      })
    })
  },

  attachMonthCardClickHandlers() {
    const self = this
    this.yearContainer.querySelectorAll('.month-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        const dayCell = e.target.closest('.month-day-cell:not(.other-month)')
        if (dayCell && dayCell.dataset.date) {
          App.openModal(dayCell.dataset.date)
        } else {
          const month = card.dataset.month
          self.currentMonth = parseInt(month)
          self.currentView = 'month'
          App.updateViewButtons()
          self.render()
        }
      })
    })
  }
}

window.Calendar = Calendar

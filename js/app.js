const App = {
  themes: [
    { id: 'default', name: '雅致金', color: '#D4A574' },
    { id: 'dark', name: '深邃蓝', color: '#1A1A2E' },
    { id: 'green', name: '清新绿', color: '#27AE60' },
    { id: 'purple', name: '典雅紫', color: '#8E44AD' },
    { id: 'red', name: '中国红', color: '#C0392B' },
    { id: 'orange', name: '温暖橙', color: '#E67E22' },
    { id: 'blue', name: '海洋蓝', color: '#2563EB' },
    { id: 'chinese-red', name: '喜庆红', color: '#DC2626' }
  ],

  init() {
    this.loadTheme()
    this.loadBackground()
    this.renderThemeOptions()
    this.bindEvents()
    Calendar.init()
    
    // 页面加载动画
    this.animatePageLoad()
    
    console.log('万年历应用已启动')
  },

  animatePageLoad() {
    document.body.style.opacity = '0'
    document.body.style.transition = 'opacity 0.6s ease'
    
    setTimeout(() => {
      document.body.style.opacity = '1'
    }, 100)

    // 添加交错动画
    const header = document.querySelector('.header')
    const calendar = document.querySelector('.calendar-container, .year-container')
    const legend = document.querySelector('.legend')
    
    if (header) {
      header.style.opacity = '0'
      header.style.transform = 'translateY(-20px)'
      header.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      
      setTimeout(() => {
        header.style.opacity = '1'
        header.style.transform = 'translateY(0)'
      }, 200)
    }
    
    if (calendar) {
      calendar.style.opacity = '0'
      calendar.style.transform = 'scale(0.98)'
      calendar.style.transition = 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s'
      
      setTimeout(() => {
        calendar.style.opacity = '1'
        calendar.style.transform = 'scale(1)'
      }, 400)
    }
    
    if (legend) {
      legend.style.opacity = '0'
      legend.style.transform = 'translateY(20px)'
      legend.style.transition = 'opacity 0.6s ease 0.4s, transform 0.6s ease 0.4s'
      
      setTimeout(() => {
        legend.style.opacity = '1'
        legend.style.transform = 'translateY(0)'
      }, 600)
    }
  },

  loadTheme() {
    const theme = Storage.getTheme()
    this.applyTheme(theme)
  },

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    Storage.setTheme(theme)
    this.updateThemeSelection(theme)
  },

  updateThemeSelection(theme) {
    document.querySelectorAll('.theme-option').forEach(el => {
      el.classList.toggle('active', el.dataset.theme === theme)
    })
  },

  renderThemeOptions() {
    const grid = document.getElementById('themeGrid')
    grid.innerHTML = this.themes.map(t => `
      <div class="theme-option" data-theme="${t.id}">${t.name}</div>
    `).join('')

    grid.querySelectorAll('.theme-option').forEach(el => {
      el.addEventListener('click', () => {
        this.applyTheme(el.dataset.theme)
        // 添加点击反馈动画
        el.style.transform = 'scale(0.95)'
        setTimeout(() => {
          el.style.transform = ''
        }, 150)
      })
    })
  },

  loadBackground() {
    const bg = Storage.getBackground()
    if (bg && bg.image) {
      document.body.style.backgroundImage = `url(${bg.image})`
      document.body.classList.add('has-bg')
      document.body.style.setProperty('--bg-opacity', (100 - bg.opacity) / 100)
      document.getElementById('bgOpacity').value = bg.opacity
      document.getElementById('opacityValue').textContent = bg.opacity
      this.updateBgPreview(bg.image)
    }
  },

  updateBgPreview(imageUrl) {
    const preview = document.getElementById('bgPreview')
    if (imageUrl) {
      preview.style.backgroundImage = `url(${imageUrl})`
      preview.textContent = ''
    } else {
      preview.style.backgroundImage = ''
      preview.textContent = '无背景图片'
    }
  },

  bindEvents() {
    document.getElementById('prevBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('prevBtn'))
      Calendar.prev()
    })

    document.getElementById('nextBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('nextBtn'))
      Calendar.next()
    })

    document.getElementById('todayBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('todayBtn'))
      Calendar.goToToday()
    })

    document.getElementById('monthViewBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('monthViewBtn'))
      Calendar.setView('month')
      this.updateViewButtons()
    })

    document.getElementById('yearViewBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('yearViewBtn'))
      Calendar.setView('year')
      this.updateViewButtons()
    })

    document.getElementById('themeBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('themeBtn'))
      document.getElementById('themeModal').classList.add('active')
    })

    document.getElementById('closeThemeModal').addEventListener('click', () => {
      document.getElementById('themeModal').classList.remove('active')
    })

    document.getElementById('bgBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('bgBtn'))
      this.openBgModal()
    })

    document.getElementById('closeBgModal').addEventListener('click', () => {
      document.getElementById('bgModal').classList.remove('active')
    })

    document.getElementById('defaultBgBtn').addEventListener('click', () => {
      this.clearBackground()
    })

    document.getElementById('customBgBtn').addEventListener('click', () => {
      document.getElementById('bgInput').click()
    })

    document.getElementById('bgInput').addEventListener('change', (e) => {
      const file = e.target.files[0]
      if (file) {
        this.setBackgroundFromFile(file)
      }
      e.target.value = ''
    })

    document.getElementById('bgOpacity').addEventListener('input', (e) => {
      const opacity = parseInt(e.target.value)
      document.getElementById('opacityValue').textContent = opacity
      document.body.style.setProperty('--bg-opacity', (100 - opacity) / 100)

      const bg = Storage.getBackground()
      if (bg) {
        bg.opacity = opacity
        Storage.setBackground(bg)
      }
    })

    document.getElementById('exportBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('exportBtn'))
      ExportService.export()
    })

    document.getElementById('importBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('importBtn'))
      document.getElementById('importInput').click()
    })

    document.getElementById('importInput').addEventListener('change', async (e) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const result = await ExportService.import(file)
        Calendar.render()
        this.showToast(
          `导入成功：新增 ${result.imported} 条，跳过 ${result.skipped} 条重复`,
          'success'
        )
      } catch (err) {
        this.showToast(err.message, 'error')
      }

      e.target.value = ''
    })

    document.getElementById('closeModal').addEventListener('click', () => {
      this.closeModal()
    })

    document.getElementById('cancelBtn').addEventListener('click', () => {
      this.closeModal()
    })

    document.getElementById('saveBtn').addEventListener('click', () => {
      this.animateButton(document.getElementById('saveBtn'))
      this.saveEvent()
    })

    document.getElementById('eventModal').addEventListener('click', (e) => {
      if (e.target.id === 'eventModal') {
        this.closeModal()
      }
    })

    document.getElementById('themeModal').addEventListener('click', (e) => {
      if (e.target.id === 'themeModal') {
        document.getElementById('themeModal').classList.remove('active')
      }
    })

    document.getElementById('bgModal').addEventListener('click', (e) => {
      if (e.target.id === 'bgModal') {
        document.getElementById('bgModal').classList.remove('active')
      }
    })

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal()
        document.getElementById('themeModal').classList.remove('active')
        document.getElementById('bgModal').classList.remove('active')
      }
    })
  },

  animateButton(btn) {
    btn.style.transform = 'scale(0.95)'
    setTimeout(() => {
      btn.style.transform = ''
    }, 150)
  },

  updateViewButtons() {
    document.getElementById('monthViewBtn').classList.toggle('active', Calendar.currentView === 'month')
    document.getElementById('yearViewBtn').classList.toggle('active', Calendar.currentView === 'year')
  },

  openBgModal() {
    const bg = Storage.getBackground()
    document.getElementById('bgModal').classList.add('active')

    if (bg && bg.image) {
      document.getElementById('customBgBtn').classList.add('active')
      document.getElementById('defaultBgBtn').classList.remove('active')
    } else {
      document.getElementById('defaultBgBtn').classList.add('active')
      document.getElementById('customBgBtn').classList.remove('active')
    }

    this.updateBgPreview(bg?.image)
  },

  setBackgroundFromFile(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageData = e.target.result
      const opacity = parseInt(document.getElementById('bgOpacity').value)

      document.body.style.backgroundImage = `url(${imageData})`
      document.body.classList.add('has-bg')
      document.body.style.setProperty('--bg-opacity', (100 - opacity) / 100)

      Storage.setBackground({
        image: imageData,
        opacity: opacity
      })

      this.updateBgPreview(imageData)
      document.getElementById('customBgBtn').classList.add('active')
      document.getElementById('defaultBgBtn').classList.remove('active')

      this.showToast('背景设置成功', 'success')
    }
    reader.readAsDataURL(file)
  },

  clearBackground() {
    document.body.style.backgroundImage = ''
    document.body.classList.remove('has-bg')
    Storage.clearBackground()
    this.updateBgPreview(null)
    document.getElementById('defaultBgBtn').classList.add('active')
    document.getElementById('customBgBtn').classList.remove('active')
    this.showToast('已恢复默认背景', 'success')
  },

  openModal(date) {
    const modal = document.getElementById('eventModal')
    modal.classList.add('active')
    modal.dataset.date = date

    const [year, month, day] = date.split('-').map(Number)
    const lunarInfo = LunarService.getLunarInfo(year, month, day)
    const holidayInfo = HolidayService.getInfoFromCache(date)

    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekDay = weekDays[new Date(date).getDay()]

    let dateInfoHtml = `
      <div class="solar-date">${year}年${month}月${day}日 ${weekDay}</div>
      <div class="lunar-date">
        ${lunarInfo.yearGanZhi}年（${lunarInfo.yearShengXiao}）${lunarInfo.lunarMonth}${lunarInfo.lunarDay}
      </div>
    `

    if (holidayInfo && holidayInfo.holidayName) {
      dateInfoHtml += `<div style="color: var(--accent-red); font-size: 15px; margin-top: 8px; font-weight: 600;">${holidayInfo.holidayName}</div>`
    }

    document.getElementById('dateInfo').innerHTML = dateInfoHtml

    EventManager.resetForm()
    EventManager.renderEventList(document.getElementById('eventList'), date)

    setTimeout(() => {
      document.getElementById('eventTitle').focus()
    }, 100)
  },

  closeModal() {
    const modal = document.getElementById('eventModal')
    modal.classList.remove('active')
    delete modal.dataset.date
    EventManager.resetForm()
  },

  saveEvent() {
    const title = document.getElementById('eventTitle').value.trim()
    const time = document.getElementById('eventTime').value
    const type = document.getElementById('eventType').value
    const notes = document.getElementById('eventNotes').value.trim()
    const modal = document.getElementById('eventModal')
    const date = modal.dataset.date

    if (!title) {
      this.showToast('请输入事项标题', 'error')
      return
    }

    const editingEvent = EventManager.getEditing()

    if (editingEvent) {
      const result = EventManager.update(editingEvent.id, {
        title,
        time,
        type,
        notes
      })

      if (result.success) {
        this.showToast('更新成功', 'success')
        Calendar.render()
        EventManager.renderEventList(document.getElementById('eventList'), date)
        EventManager.resetForm()
      } else {
        this.showToast(result.error, 'error')
      }
    } else {
      const result = EventManager.add({
        date,
        title,
        time,
        type,
        notes
      })

      if (result.success) {
        this.showToast('添加成功', 'success')
        Calendar.render()
        EventManager.renderEventList(document.getElementById('eventList'), date)
        EventManager.resetForm()
      } else {
        this.showToast(result.error, 'error')
      }
    }
  },

  showToast(message, type = 'info') {
    const toast = document.getElementById('toast')
    toast.textContent = message
    toast.className = 'toast show ' + type

    setTimeout(() => {
      toast.classList.remove('show')
    }, 3000)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  App.init()
})

window.App = App

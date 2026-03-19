const App = {
  themes: [
    { id: 'default', name: '默认蓝' },
    { id: 'dark', name: '暗黑' },
    { id: 'green', name: '清新绿' },
    { id: 'purple', name: '典雅紫' },
    { id: 'red', name: '中国红' },
    { id: 'orange', name: '活力橙' }
  ],

  init() {
    this.loadTheme()
    this.loadBackground()
    this.renderThemeOptions()
    this.bindEvents()
    Calendar.init()

    console.log('万年历应用已启动')
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
      Calendar.prev()
    })

    document.getElementById('nextBtn').addEventListener('click', () => {
      Calendar.next()
    })

    document.getElementById('todayBtn').addEventListener('click', () => {
      Calendar.goToToday()
    })

    document.getElementById('monthViewBtn').addEventListener('click', () => {
      Calendar.setView('month')
      this.updateViewButtons()
    })

    document.getElementById('yearViewBtn').addEventListener('click', () => {
      Calendar.setView('year')
      this.updateViewButtons()
    })

    document.getElementById('themeBtn').addEventListener('click', () => {
      document.getElementById('themeModal').classList.add('active')
    })

    document.getElementById('closeThemeModal').addEventListener('click', () => {
      document.getElementById('themeModal').classList.remove('active')
    })

    document.getElementById('bgBtn').addEventListener('click', () => {
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
      ExportService.export()
    })

    document.getElementById('importBtn').addEventListener('click', () => {
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
      dateInfoHtml += `<div style="color: var(--holiday-color); font-size: 16px; margin-top: 6px; font-weight: 500;">${holidayInfo.holidayName}</div>`
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
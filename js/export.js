const ExportService = {
  export() {
    const events = Storage.getEvents()
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalEvents: events.length,
      events
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `calendar_backup_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    URL.revokeObjectURL(url)
    
    App.showToast(`已导出 ${events.length} 条事项`, 'success')
  },

  import(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result)
          
          if (!data.events || !Array.isArray(data.events)) {
            reject(new Error('无效的文件格式'))
            return
          }

          const existing = Storage.getEvents()
          const existingIds = new Set(existing.map(e => e.id))
          
          const newEvents = data.events.filter(e => !existingIds.has(e.id))
          const merged = [...existing, ...newEvents]
          
          Storage.saveEvents(merged)
          
          resolve({
            imported: newEvents.length,
            skipped: data.events.length - newEvents.length,
            total: merged.length
          })
        } catch (err) {
          reject(new Error('文件解析失败: ' + err.message))
        }
      }
      
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsText(file)
    })
  }
}

window.ExportService = ExportService
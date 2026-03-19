const EventManager = {
  editingEventId: null,

  getByDate(date) {
    return Storage.getEventsByDate(date)
  },

  getAll() {
    return Storage.getEvents()
  },

  add(eventData) {
    if (!eventData.title || !eventData.date) {
      return { success: false, error: '标题和日期不能为空' }
    }

    const event = Storage.addEvent(eventData)
    return { success: true, event }
  },

  update(id, updates) {
    const event = Storage.updateEvent(id, updates)
    if (event) {
      return { success: true, event }
    }
    return { success: false, error: '事项不存在' }
  },

  delete(id) {
    Storage.deleteEvent(id)
    return { success: true }
  },

  setEditing(id) {
    this.editingEventId = id
  },

  getEditing() {
    if (!this.editingEventId) return null
    const events = Storage.getEvents()
    return events.find(e => e.id === this.editingEventId) || null
  },

  clearEditing() {
    this.editingEventId = null
  },

  renderEventList(container, date) {
    const events = this.getByDate(date)
    
    if (events.length === 0) {
      container.innerHTML = '<div class="no-events">暂无事项</div>'
      return
    }

    const typeLabels = {
      work: '工作',
      personal: '个人',
      reminder: '提醒'
    }

    const typeColors = {
      work: '#2563eb',
      personal: '#16a34a',
      reminder: '#f97316'
    }

    container.innerHTML = events.map(event => `
      <div class="event-item" data-id="${event.id}">
        <div class="event-item-content">
          <div class="event-item-title" style="border-left: 3px solid ${typeColors[event.type]}; padding-left: 8px;">
            ${event.time || ''} ${event.title}
          </div>
          ${event.notes ? `<div class="event-item-time">${event.notes}</div>` : ''}
        </div>
        <div class="event-item-actions">
          <button class="btn-edit" data-action="edit" data-id="${event.id}">编辑</button>
          <button class="btn-delete" data-action="delete" data-id="${event.id}">删除</button>
        </div>
      </div>
    `).join('')

    container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action
        const id = e.target.dataset.id
        
        if (action === 'edit') {
          this.handleEdit(id)
        } else if (action === 'delete') {
          this.handleDelete(id)
        }
      })
    })
  },

  handleEdit(id) {
    const event = Storage.getEvents().find(e => e.id === id)
    if (!event) return

    this.setEditing(id)
    
    document.getElementById('eventTitle').value = event.title
    document.getElementById('eventTime').value = event.time || ''
    document.getElementById('eventType').value = event.type
    document.getElementById('eventNotes').value = event.notes || ''
    
    document.getElementById('saveBtn').textContent = '更新'
  },

  handleDelete(id) {
    if (confirm('确定要删除这个事项吗？')) {
      this.delete(id)
      Calendar.render()
      
      const modal = document.getElementById('eventModal')
      const currentDate = modal.dataset.date
      if (currentDate) {
        this.renderEventList(document.getElementById('eventList'), currentDate)
      }
      
      App.showToast('删除成功', 'success')
    }
  },

  resetForm() {
    document.getElementById('eventTitle').value = ''
    document.getElementById('eventTime').value = ''
    document.getElementById('eventType').value = 'work'
    document.getElementById('eventNotes').value = ''
    document.getElementById('saveBtn').textContent = '保存'
    this.clearEditing()
  }
}

window.EventManager = EventManager
// ... existing imports and code ...

// Add to the form, before the form-actions div
<div className="form-section">
  <h3>ClickUp Information</h3>
  <div className="form-grid">
    <div className="form-field">
      <label htmlFor="clientFolderId">ClickUp Folder ID</label>
      <input
        type="text"
        id="clientFolderId"
        value={formData.clientFolderId}
        onChange={e => setFormData({...formData, clientFolderId: e.target.value})}
      />
    </div>
    <div className="form-field">
      <label htmlFor="clientListTaskId">ClickUp Client List Task ID</label>
      <input
        type="text"
        id="clientListTaskId"
        value={formData.clientListTaskId}
        onChange={e => setFormData({...formData, clientListTaskId: e.target.value})}
      />
    </div>
  </div>
</div>
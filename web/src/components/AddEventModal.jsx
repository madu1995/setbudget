import React, { useState } from 'react';

const AddEventModal = ({ isOpen, onClose, onEventAdded }) => {
  const [isDetailedMode, setIsDetailedMode] = useState(false);
  const [formData, setFormData] = useState({
    eventName: '',
    category: '',
    startDate: '',
    endDate: '',
    estimatedBudget: '',
    splitMethod: 'Equal Split', // Default
    location: '',
    description: '',
    coverImage: null,
    initialParticipants: '',
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'coverImage') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    // Clear error when user types
    if (name === 'eventName' && value.trim() !== '') {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.eventName.trim()) {
      setError('Event Name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('eventName', formData.eventName);
      data.append('category', formData.category);
      data.append('mode', isDetailedMode ? 'detailed' : 'quick');
      
      if (isDetailedMode) {
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        data.append('estimatedBudget', formData.estimatedBudget);
        data.append('splitMethod', formData.splitMethod);
        data.append('location', formData.location);
        data.append('description', formData.description);
        data.append('initialParticipants', formData.initialParticipants);
        if (formData.coverImage) {
          data.append('coverImage', formData.coverImage);
        }
      }

      const response = await fetch('http://localhost:5000/api/events/add', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        onEventAdded(result.event);
        onClose(); 
      } else {
        setError(result.message || result.error || 'Failed to add event');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('An error occurred while adding the event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
  };

  const modalContentStyle = {
    backgroundColor: '#121212', 
    color: '#ffffff',
    padding: '24px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #333'
  };

  const inputStyle = {
    width: '100%', padding: '10px', marginTop: '4px', marginBottom: '16px',
    backgroundColor: '#1e1e1e', border: '1px solid #444', color: '#fff', borderRadius: '6px',
    boxSizing: 'border-box'
  };

  const buttonStyle = {
    backgroundColor: '#007BFF',
    color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px',
    cursor: 'pointer', fontWeight: 'bold', width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Add New Event</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => setIsDetailedMode(false)}
            style={{ ...buttonStyle, backgroundColor: !isDetailedMode ? '#007BFF' : '#333', flex: 1 }}
          >
            Quick Add
          </button>
          <button 
            type="button"
            onClick={() => setIsDetailedMode(true)}
            style={{ ...buttonStyle, backgroundColor: isDetailedMode ? '#007BFF' : '#333', flex: 1 }}
          >
            Detailed Add
          </button>
        </div>

        {error && <div style={{ color: '#ff4d4d', marginBottom: '16px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Event Name *</label>
          <input type="text" name="eventName" value={formData.eventName} onChange={handleChange} style={inputStyle} placeholder="E.g. Bali Trip 2026" />

          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
            <option value="">Select a category...</option>
            <option value="Trip">Trip</option>
            <option value="Party">Party</option>
            <option value="Project">Project</option>
            <option value="Other">Other</option>
          </select>

          {isDetailedMode && (
            <>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Estimated Budget</label>
              <input type="number" name="estimatedBudget" value={formData.estimatedBudget} onChange={handleChange} style={inputStyle} placeholder="0.00" />

              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Split Method</label>
              <select name="splitMethod" value={formData.splitMethod} onChange={handleChange} style={inputStyle}>
                <option value="Equal Split">Equal Split</option>
                <option value="Exact Amounts">Exact Amounts</option>
                <option value="Percentages">Percentages</option>
              </select>

              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} style={inputStyle} placeholder="Event location" />

              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Event details..." />

              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Cover Image</label>
              <input type="file" name="coverImage" accept="image/*" onChange={handleChange} style={{ ...inputStyle, padding: '8px' }} />

              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '4px' }}>Initial Participants (comma separated emails)</label>
              <input type="text" name="initialParticipants" value={formData.initialParticipants} onChange={handleChange} style={inputStyle} placeholder="john@example.com, jane@example.com" />
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ ...buttonStyle, backgroundColor: 'transparent', border: '1px solid #444', width: 'auto' }}>Cancel</button>
            <button type="submit" disabled={isSubmitting} style={{ ...buttonStyle, width: 'auto' }}>
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';

const AddParticipantModal = ({ isOpen, onClose, onParticipantAdded, onParticipantUpdated, participantToEdit }) => {
  const { isModerator } = useAuth();
  const { activeEvent } = useBudget();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    paymentMode: 'Full Share',
    fixedAmount: '',
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (participantToEdit && isOpen) {
      setFormData({
        name: participantToEdit.name || '',
        phone: participantToEdit.phone || '',
        paymentMode: participantToEdit.paymentMode || 'Full Share',
        fixedAmount: participantToEdit.fixedAmount || '',
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        paymentMode: 'Full Share',
        fixedAmount: '',
      });
    }
  }, [participantToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const validatePhone = (phone) => {
    if (!phone) return true;
    const slPhoneRegex = /^(?:0|94|\+94)?7(?:0|1|2|4|5|6|7|8)\d{7}$/;
    return slPhoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Name is required.');
      return;
    }

    if (formData.phone && !validatePhone(formData.phone)) {
      setError('Please enter a valid Sri Lankan phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (participantToEdit) {
        await onParticipantUpdated(participantToEdit._id, {
          name: formData.name,
          phone: formData.phone,
          paymentMode: formData.paymentMode,
          fixedAmount: formData.fixedAmount
        });
      } else {
        await onParticipantAdded(formData.name, formData.phone, formData.paymentMode, formData.fixedAmount);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${participantToEdit ? 'update' : 'add'} participant`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalOverlayStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1100
  };

  const modalContentStyle = {
    backgroundColor: '#ffffff', 
    color: '#121212',
    padding: '24px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
  };

  const inputStyle = {
    width: '100%', padding: '12px', marginTop: '6px', marginBottom: '16px',
    backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', color: '#333', borderRadius: '8px',
    boxSizing: 'border-box', fontSize: '1rem'
  };

  const buttonStyle = {
    backgroundColor: '#007BFF',
    color: 'white', padding: '12px', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1rem',
    marginTop: '10px'
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>{participantToEdit ? 'Edit Participant' : 'Add New Participant'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>

        {error && <div style={{ color: '#dc3545', marginBottom: '16px', fontSize: '0.9rem', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '6px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#495057' }}>Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="John Doe" />

          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#495057' }}>Phone Number (Optional)</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="07XXXXXXXX" />

          {isModerator(activeEvent) && (
            <>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#495057' }}>Payment Mode</label>
              <select name="paymentMode" value={formData.paymentMode} onChange={handleChange} style={inputStyle}>
                <option value="Full Share">Full Share</option>
                <option value="Fixed Amount">Fixed Amount</option>
              </select>

              {formData.paymentMode === 'Fixed Amount' && (
                <>
                  <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#495057' }}>Fixed Amount (LKR)</label>
                  <input type="number" name="fixedAmount" value={formData.fixedAmount} onChange={handleChange} style={inputStyle} placeholder="e.g. 1500" min="0" />
                </>
              )}
            </>
          )}

          <button type="submit" disabled={isSubmitting} style={buttonStyle}>
            {isSubmitting ? 'Saving...' : (participantToEdit ? 'Save Changes' : 'Add Participant')}
          </button>
          
          <button type="button" onClick={onClose} style={{ ...buttonStyle, backgroundColor: 'transparent', color: '#6c757d', marginTop: '5px' }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddParticipantModal;

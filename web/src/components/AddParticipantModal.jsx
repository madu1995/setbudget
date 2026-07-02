import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBudget } from '../context/BudgetContext';

const AddParticipantModal = ({ isOpen, onClose, onParticipantAdded, onParticipantUpdated, participantToEdit }) => {
  const { isModerator } = useAuth();
  const { activeEvent } = useBudget();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    paymentMode: 'Fixed Amount',
    baseFee: '',
    initialDeposit: '',
    directContribution: '',
    materialsContributed: [],
  });
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (participantToEdit && isOpen) {
      setFormData({
        name: participantToEdit.name || '',
        phone: participantToEdit.phone || '',
        paymentMode: participantToEdit.paymentMode || 'Fixed Amount',
        baseFee: participantToEdit.baseFee || participantToEdit.fixedAmount || '',
        initialDeposit: participantToEdit.initialDeposit || '',
        directContribution: participantToEdit.directContribution || '',
        materialsContributed: participantToEdit.materialsContributed || [],
      });
    } else if (isOpen) {
      setFormData({
        name: '',
        phone: '',
        paymentMode: 'Fixed Amount',
        baseFee: '',
        initialDeposit: '',
        directContribution: '',
        materialsContributed: [],
      });
    }
  }, [participantToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError('');
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...formData.materialsContributed];
    updated[index][field] = value;
    setFormData({ ...formData, materialsContributed: updated });
  };

  const addMaterialField = () => {
    setFormData({
      ...formData,
      materialsContributed: [...formData.materialsContributed, { itemName: '', quantity: '', notes: '' }]
    });
  };

  const removeMaterialField = (index) => {
    const updated = formData.materialsContributed.filter((_, i) => i !== index);
    setFormData({ ...formData, materialsContributed: updated });
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
          baseFee: formData.baseFee === '' ? 0 : Number(formData.baseFee),
          fixedAmount: formData.baseFee === '' ? 0 : Number(formData.baseFee), // Keep for backward compatibility
          initialDeposit: formData.initialDeposit === '' ? 0 : Number(formData.initialDeposit),
          directContribution: formData.directContribution === '' ? 0 : Number(formData.directContribution),
          materialsContributed: formData.materialsContributed.filter(m => m.itemName.trim() !== '')
        });
      } else {
        await onParticipantAdded(
          formData.name,
          formData.phone,
          formData.paymentMode,
          formData.baseFee === '' ? 0 : Number(formData.baseFee),
          formData.initialDeposit === '' ? 0 : Number(formData.initialDeposit),
          formData.directContribution === '' ? 0 : Number(formData.directContribution),
          formData.materialsContributed.filter(m => m.itemName.trim() !== '')
        );
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
    maxWidth: '420px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const inputStyle = {
    width: '100%', padding: '12px', marginTop: '6px', marginBottom: '16px',
    backgroundColor: '#f8f9fa', border: '1px solid #dee2e6', color: '#333', borderRadius: '8px',
    boxSizing: 'border-box', fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block', fontSize: '0.9rem', fontWeight: '600', color: '#495057'
  };

  const buttonStyle = {
    backgroundColor: '#007BFF',
    color: 'white', padding: '12px', border: 'none', borderRadius: '8px',
    cursor: 'pointer', fontWeight: 'bold', width: '100%', fontSize: '1rem',
    marginTop: '10px'
  };

  const depositSectionStyle = {
    backgroundColor: '#f0f7ff',
    border: '1px solid #b3d4f5',
    borderRadius: '8px',
    padding: '14px 16px',
    marginBottom: '16px',
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
          <label style={labelStyle}>Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="John Doe" />

          <label style={labelStyle}>Phone Number (Optional)</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} placeholder="07XXXXXXXX" />

          {activeEvent?.eventType === 'community_project' ? (
            <>
              <div style={{ ...depositSectionStyle, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                <label style={{ ...labelStyle, color: '#15803d', marginBottom: '4px' }}>
                  🤝 Direct Contribution (LKR)
                </label>
                <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 8px 0' }}>
                  Financial donation towards the community project.
                </p>
                <input
                  type="number"
                  name="directContribution"
                  value={formData.directContribution}
                  onChange={handleChange}
                  style={{ ...inputStyle, marginBottom: 0, backgroundColor: 'white' }}
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                <label style={labelStyle}>Materials Contributed</label>
                <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 8px 0' }}>
                  E.g., Bamboo, Bulbs, Paint
                </p>
                {formData.materialsContributed.map((m, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <input 
                      type="text" 
                      placeholder="Item Name" 
                      value={m.itemName} 
                      onChange={(e) => handleMaterialChange(index, 'itemName', e.target.value)} 
                      style={{ ...inputStyle, marginBottom: 0, padding: '8px', flex: 2 }} 
                    />
                    <input 
                      type="text" 
                      placeholder="Qty" 
                      value={m.quantity} 
                      onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)} 
                      style={{ ...inputStyle, marginBottom: 0, padding: '8px', flex: 1 }} 
                    />
                    <button 
                      type="button" 
                      onClick={() => removeMaterialField(index)} 
                      style={{ background: '#DC2626', color: 'white', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer' }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addMaterialField} 
                  style={{ background: 'transparent', color: '#15803d', border: '1px dashed #15803d', borderRadius: '6px', padding: '8px', cursor: 'pointer', width: '100%', fontSize: '0.85rem' }}
                >
                  + Add Material
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Common Fund Deposit — always visible for Trip/Party */}
              <div style={depositSectionStyle}>
                <label style={{ ...labelStyle, color: '#1d4ed8', marginBottom: '4px' }}>
                  💰 Initial Fund Deposit (LKR)
                </label>
                <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 8px 0' }}>
                  Amount contributed to the common fund before the event.
                </p>
                <input
                  type="number"
                  name="initialDeposit"
                  value={formData.initialDeposit}
                  onChange={handleChange}
                  style={{ ...inputStyle, marginBottom: 0, backgroundColor: 'white' }}
                  placeholder="0"
                  min="0"
                />
              </div>

              {isModerator(activeEvent) && (
                <>
                  <label style={labelStyle}>Target Contribution (Base Fee) *</label>
                  <p style={{ fontSize: '0.78rem', color: '#6B7280', margin: '0 0 8px 0' }}>
                    Base amount for this participant (e.g. 2500 for drinkers, 1000 for non-drinkers).
                  </p>
                  <input
                    type="number"
                    name="baseFee"
                    value={formData.baseFee}
                    onChange={handleChange}
                    style={inputStyle}
                    placeholder="e.g. 2500"
                    min="0"
                    required
                  />
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

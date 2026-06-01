import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';

const Card = styled.div`
  background: ${props => props.theme.colors.card};
  border-radius: ${props => props.theme.radius.md};
  box-shadow: ${props => props.theme.shadows.card};
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: fit-content;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.sm};
  font-family: inherit;
  font-size: 0.95rem;
  background-color: white;

  &::placeholder { color: #9CA3AF; }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.sm};
  font-family: inherit;
  font-size: 0.95rem;
  background-color: white;
`;

const UploadBtn = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 12px;
  border-radius: ${props => props.theme.radius.sm};
  font-weight: 600;
  cursor: pointer;
`;

const ReceiptPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background-color: #F8F9FA;
  border-radius: ${props => props.theme.radius.sm};
  border: 1px solid #E0E0E0;
`;

const Thumbnail = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
`;

const FileName = styled.span`
  flex: 1;
  font-size: 0.85rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const SubmitBtn = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 15px;
  border-radius: ${props => props.theme.radius.sm};
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

// Recent Expenses Components
const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const ExpenseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #F1F5F9;

  &:last-child { border-bottom: none; }
`;

const ExpenseIcon = () => (
  <div style={{ backgroundColor: '#F1F5F9', padding: '10px', borderRadius: '8px', color: '#6B7280' }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
    </svg>
  </div>
);

const Footer = styled.div`
  margin-top: auto;
  text-align: center;
  padding-top: 30px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  border-top: 1px solid #F1F5F9;
`;

export default function ExpenseForm({ mode = 'add' }) {
  const { participants, addExpense, updateExpense, deleteExpense, activeEvent, expenses } = useBudget();
  const { isModerator } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editDesc, setEditDesc] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPaidBy, setEditPaidBy] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleEditClick = (exp) => {
    setEditingId(exp._id);
    setEditDesc(exp.description);
    setEditAmount(exp.amount);
    setEditPaidBy(exp.paidBy?._id || exp.paidBy);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editDesc || !editAmount || !editPaidBy) return;
    await updateExpense(editingId, {
      description: editDesc,
      amount: editAmount,
      paidBy: editPaidBy
    });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await deleteExpense(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || !paidBy) return;

    const formData = new FormData();
    formData.append('description', description);
    formData.append('amount', amount);
    formData.append('paidBy', paidBy);
    formData.append('eventId', activeEvent._id);
    if (file) formData.append('receipt', file);

    await addExpense(formData);
    
    setDescription('');
    setAmount('');
    setPaidBy('');
    setFile(null);
    setPreview('');
    if(fileInputRef.current) fileInputRef.current.value = null;
  };

  if (!activeEvent) return null;

  if (mode === 'list') {
    return (
      <Card>
        <ListContainer>
          {expenses.length === 0 && <p style={{ color: '#6B7280', fontSize: '0.9rem' }}>No recent expenses.</p>}
          {expenses.map(exp => {
            if (editingId === exp._id) {
              return (
                <ExpenseItem key={exp._id} style={{ flexDirection: 'column', alignItems: 'stretch', gap: '10px' }}>
                  <Input 
                    value={editDesc} 
                    onChange={e => setEditDesc(e.target.value)} 
                    placeholder="Description" 
                  />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Input 
                      type="number" 
                      value={editAmount} 
                      onChange={e => setEditAmount(e.target.value)} 
                      placeholder="Amount" 
                      style={{ flex: 1 }}
                    />
                    <Select value={editPaidBy} onChange={e => setEditPaidBy(e.target.value)} style={{ flex: 1 }}>
                      <option value="FUND">💰 Event Fund</option>
                      {participants.map(p => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setEditingId(null)} style={{ padding: '8px 16px', background: '#F1F5F9', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                    <button type="button" onClick={handleUpdate} style={{ padding: '8px 16px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                  </div>
                </ExpenseItem>
              );
            }

            const isFund = exp.paidBy === 'FUND' || exp.paidBy?._id === 'FUND';
            const payerName = isFund ? '💰 Event Fund' : (exp.paidBy?.name || 'Unknown');

            return (
              <ExpenseItem key={exp._id}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <ExpenseIcon />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{exp.description}</div>
                    <div style={{ color: isFund ? '#1d4ed8' : '#6B7280', fontSize: '0.85rem' }}>
                      Paid by {payerName}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                  <div style={{ fontWeight: 700 }}>LKR {exp.amount.toLocaleString()}</div>
                  {isModerator(activeEvent) && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditClick(exp)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }} title="Edit">✏️</button>
                      <button onClick={() => handleDelete(exp._id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1rem' }} title="Delete">🗑️</button>
                    </div>
                  )}
                </div>
              </ExpenseItem>
            );
          })}
        </ListContainer>
        <Footer>Active Event: {activeEvent.name}</Footer>
      </Card>
    );
  }

  return (
    <Card as="form" onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Description (e.g., Lunch)</Label>
        <Input 
          placeholder="Lunch - Food Hut 🍲" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          required 
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Amount (LKR)</Label>
        <Input 
          type="number" 
          placeholder="LKR 3,850.00" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          required 
        />
      </FormGroup>

      <FormGroup>
        <Label>Paid By (Dropdown)</Label>
        <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
          <option value="" disabled>Select Payer</option>
          <option value="FUND">💰 Event Fund</option>
          {participants.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </Select>
      </FormGroup>

      <div style={{ marginTop: '5px' }}>
        <input 
          type="file" 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        <UploadBtn type="button" onClick={() => fileInputRef.current.click()}>
          Upload Receipt
        </UploadBtn>
      </div>

      {preview && (
        <ReceiptPreview>
          <Thumbnail src={preview} />
          <FileName>{file?.name || 'receipt.jpg'}</FileName>
          <div style={{ color: '#007BFF' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          </div>
        </ReceiptPreview>
      )}

      <SubmitBtn type="submit" disabled={participants.length === 0}>
        Add Expense
      </SubmitBtn>
    </Card>
  );
}

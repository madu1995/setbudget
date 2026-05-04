import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: ${props => props.theme.radius.lg};
  width: 90%;
  max-width: 500px;
  box-shadow: ${props => props.theme.shadows.lg};
`;

const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.secondary};
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 20px 0;
  max-height: 200px;
  overflow-y: auto;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const Btn = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: bold;
`;

const AddBtn = styled(Btn)`
  background-color: #007BFF;
  color: white;
`;

const RemoveBtn = styled(Btn)`
  background-color: #DC2626;
  color: white;
`;

const API_URL = 'http://localhost:5000/api';

export default function ManageModeratorsModal({ isOpen, onClose, eventId }) {
  const [users, setUsers] = useState([]);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    if (isOpen && eventId) {
      fetchData();
    }
  }, [isOpen, eventId]);

  const fetchData = async () => {
    try {
      const usersRes = await axios.get(`${API_URL}/users`);
      const eventsRes = await axios.get(`${API_URL}/events`);
      setUsers(usersRes.data);
      setEventData(eventsRes.data.find(e => e._id === eventId));
    } catch (err) {
      console.error(err);
    }
  };

  const addModerator = async (userId) => {
    try {
      await axios.post(`${API_URL}/events/${eventId}/moderators`, { userId });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const removeModerator = async (userId) => {
    try {
      await axios.delete(`${API_URL}/events/${eventId}/moderators/${userId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen || !eventData) return null;

  const currentModeratorIds = eventData.moderators || [];

  return (
    <ModalOverlay>
      <ModalContent>
        <Title>Manage Moderators</Title>
        <List>
          {users.map(u => {
            if (u.role === 'admin') return null; // Admins already have access
            const isMod = currentModeratorIds.includes(u._id);
            return (
              <ListItem key={u._id}>
                <span>{u.name} (@{u.username})</span>
                {isMod ? (
                  <RemoveBtn onClick={() => removeModerator(u._id)}>Remove</RemoveBtn>
                ) : (
                  <AddBtn onClick={() => addModerator(u._id)}>Add</AddBtn>
                )}
              </ListItem>
            );
          })}
        </List>
        <div style={{ textAlign: 'right' }}>
          <Btn onClick={onClose} style={{ background: '#E0E0E0' }}>Close</Btn>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
}

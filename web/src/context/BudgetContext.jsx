import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const BudgetContext = createContext();

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlementReport, setSettlementReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
      if (res.data.length > 0 && !activeEvent) {
        selectEvent(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectEvent = async (eventId) => {
    const event = events.find(e => e._id.toString() === eventId.toString());
    setActiveEvent(event);
    if(eventId) {
      fetchParticipants(eventId);
      fetchExpenses(eventId);
      fetchSettlementReport(eventId);
    }
  };

  const fetchSettlementReport = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/events/${eventId}/settlement-report`);
      setSettlementReport(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchParticipants = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/participants/event/${eventId}`);
      setParticipants(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExpenses = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/expenses/event/${eventId}`);
      setExpenses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addEvent = async (eventData) => {
    try {
      const res = await axios.post(`${API_URL}/events`, eventData);
      setEvents([res.data, ...events]);
      selectEvent(res.data._id);
    } catch (err) {
      console.error(err);
    }
  };

  const addParticipant = async (name, phone) => {
    if (!activeEvent) return;
    try {
      const res = await axios.post(`${API_URL}/participants`, {
        name,
        phone,
        eventId: activeEvent._id
      });
      setParticipants([...participants, res.data]);
      fetchSettlementReport(activeEvent._id);
      return res.data; // Return for component use
    } catch (err) {
      console.error(err);
      throw err; // Throw for component to handle errors
    }
  };

  const addExpense = async (formData) => {
    if (!activeEvent) return;
    try {
      const res = await axios.post(`${API_URL}/expenses`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setExpenses([res.data, ...expenses]);
      fetchSettlementReport(activeEvent._id);
    } catch (err) {
      console.error(err);
    }
  };

  const closeEvent = async () => {
    if(!activeEvent) return;
    try {
        const res = await axios.patch(`${API_URL}/events/${activeEvent._id}/close`);
        setEvents(events.map(e => e._id === activeEvent._id ? res.data : e));
        setActiveEvent(res.data);
    } catch (err) {
        console.error(err);
    }
  }

  const totals = {
    budget: activeEvent ? activeEvent.totalBudget : 0,
    spent: expenses.reduce((acc, curr) => acc + curr.amount, 0),
    remaining: activeEvent ? activeEvent.totalBudget - expenses.reduce((acc, curr) => acc + curr.amount, 0) : 0,
    participantCount: participants.length
  };

  const deleteEvent = async (id) => {
    try {
      await axios.delete(`${API_URL}/events/${id}`);
      setEvents(events.filter(e => e._id !== id));
      if (activeEvent && activeEvent._id === id) {
        setActiveEvent(null);
        // Optionally select the first remaining event
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateEvent = async (id, eventData) => {
    try {
      const res = await axios.put(`${API_URL}/events/${id}`, eventData);
      setEvents(events.map(e => e._id === id ? res.data : e));
      if (activeEvent && activeEvent._id === id) {
        setActiveEvent(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <BudgetContext.Provider value={{
      events,
      activeEvent,
      selectEvent,
      participants,
      expenses,
      addEvent,
      deleteEvent,
      updateEvent,
      addParticipant,
      addExpense,
      closeEvent,
      fetchEvents, 
      fetchSettlementReport,
      settlementReport,
      totals,
      loading,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

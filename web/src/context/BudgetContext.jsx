import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { useAuth } from './AuthContext';

const BudgetContext = createContext();

export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [pendingBills, setPendingBills] = useState([]);
  const [borrowedItems, setBorrowedItems] = useState([]);
  const [publicDonations, setPublicDonations] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


  useEffect(() => {
    if (user && !user.requiresPasswordChange) {
      fetchEvents();
    } else {
      setEvents([]);
      setActiveEvent(null);
      setParticipants([]);
      setExpenses([]);
      setSummaryData(null);
      setTasks([]);
      setPendingBills([]);
      setBorrowedItems([]);
      setPublicDonations([]);
    }
  }, [user]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/events`);
      setEvents(res.data);
      if (res.data.length > 0 && !activeEvent) {
        selectEvent(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectEvent = async (eventId) => {
    const event = events.find(e => e._id.toString() === eventId.toString());
    setActiveEvent(event);
    if(eventId) {
      fetchParticipants(eventId);
      fetchExpenses(eventId);
      fetchSummary(eventId);
      fetchTasks(eventId);
      fetchPendingBills(eventId);
      fetchBorrowedItems(eventId);
      fetchPublicDonations(eventId);
    }
  };

  const fetchSummary = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/events/${eventId}/summary`);
      setSummaryData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/tasks/event/${eventId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPendingBills = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/pending-bills/event/${eventId}`);
      setPendingBills(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBorrowedItems = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/borrowed-items/event/${eventId}`);
      setBorrowedItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPublicDonations = async (eventId) => {
    try {
      const res = await axios.get(`${API_URL}/public-donations/event/${eventId}`);
      setPublicDonations(res.data);
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

  const addParticipant = async (name, phone, paymentMode = 'Full Share', fixedAmount = 0, initialDeposit = 0, directContribution = 0, materialsContributed = []) => {
    if (!activeEvent) return;
    try {
      const res = await axios.post(`${API_URL}/participants`, {
        name,
        phone,
        paymentMode,
        fixedAmount,
        initialDeposit,
        directContribution,
        materialsContributed,
        eventId: activeEvent._id
      });
      setParticipants([...participants, res.data]);
      fetchSummary(activeEvent._id);
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const updateParticipant = async (id, updateData) => {
    if (!activeEvent) return;
    try {
      const res = await axios.put(`${API_URL}/participants/${id}/event/${activeEvent._id}`, updateData);
      setParticipants(participants.map(p => p._id === id ? res.data : p));
      fetchSummary(activeEvent._id);
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const addExpense = async (formData) => {
    if (!activeEvent) return;
    try {
      await axios.post(`${API_URL}/expenses`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchExpenses(activeEvent._id);
      fetchSummary(activeEvent._id);
    } catch (err) {
      console.error(err);
    }
  };

  const updateExpense = async (id, updateData) => {
    if (!activeEvent) return;
    try {
      await axios.put(`${API_URL}/expenses/${id}`, updateData);
      fetchExpenses(activeEvent._id);
      fetchSummary(activeEvent._id);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteExpense = async (id) => {
    if (!activeEvent) return;
    try {
      await axios.delete(`${API_URL}/expenses/${id}`);
      fetchExpenses(activeEvent._id);
      fetchSummary(activeEvent._id);
    } catch (err) {
      console.error(err);
    }
  };

  const addTask = async (taskData) => {
    if (!activeEvent) return;
    try {
      const res = await axios.post(`${API_URL}/tasks/event/${activeEvent._id}`, taskData);
      setTasks([...tasks, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    if (!activeEvent) return;
    try {
      const res = await axios.patch(`${API_URL}/tasks/${taskId}/status`, { status });
      setTasks(tasks.map(t => t._id === taskId ? res.data.task : t));
    } catch (err) {
      console.error(err);
    }
  };

  const addPendingBill = async (billData) => {
    if (!activeEvent) return;
    try {
      const res = await axios.post(`${API_URL}/pending-bills/event/${activeEvent._id}`, billData);
      setPendingBills([...pendingBills, res.data]);
      fetchSummary(activeEvent._id);
    } catch (err) {
      console.error(err);
    }
  };

  const payPendingBill = async (billId) => {
    if (!activeEvent) return;
    try {
      const res = await axios.patch(`${API_URL}/pending-bills/${billId}/pay`);
      setPendingBills(pendingBills.map(b => b._id === billId ? res.data.pendingBill : b));
      fetchExpenses(activeEvent._id);
      fetchSummary(activeEvent._id);
    } catch (err) {
      console.error(err);
    }
  };

  const addBorrowedItem = async (itemData) => {
    if (!activeEvent) return;
    try {
      const res = await axios.post(`${API_URL}/events/${activeEvent._id}/borrowed-items`, itemData);
      setBorrowedItems([...borrowedItems, res.data]);
      fetchSummary(activeEvent._id);
    } catch (err) {
      console.error(err);
    }
  };

  const returnBorrowedItem = async (itemId) => {
    if (!activeEvent) return;
    try {
      const res = await axios.patch(`${API_URL}/borrowed-items/${itemId}/return`);
      setBorrowedItems(borrowedItems.map(i => i._id === itemId ? res.data.item : i));
    } catch (err) {
      console.error(err);
    }
  };

  const addPublicDonation = async (donationData) => {
    if (!activeEvent) return;
    try {
      const res = await axios.post(`${API_URL}/public-donations/event/${activeEvent._id}`, donationData);
      setPublicDonations([...publicDonations, res.data]);
      fetchSummary(activeEvent._id);
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

  const totalFundCollected = participants.reduce((acc, p) => acc + (p.initialDeposit || 0), 0);
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const budgetAmount = totalFundCollected > 0 ? totalFundCollected : (activeEvent ? activeEvent.totalBudget : 0);

  const totals = {
    budget: budgetAmount,
    spent: totalSpent,
    remaining: budgetAmount - totalSpent,
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
      tasks,
      pendingBills,
      borrowedItems,
      publicDonations,
      summaryData,
      addEvent,
      deleteEvent,
      updateEvent,
      addParticipant,
      updateParticipant,
      addExpense,
      updateExpense,
      deleteExpense,
      addTask,
      updateTaskStatus,
      addPendingBill,
      payPendingBill,
      addBorrowedItem,
      returnBorrowedItem,
      addPublicDonation,
      closeEvent,
      fetchEvents, 
      fetchSummary,
      settlementReport: summaryData, // Keep alias for backwards compatibility during refactor
      totals,
      loading,
      searchQuery,
      setSearchQuery
    }}>
      {children}
    </BudgetContext.Provider>
  );
};

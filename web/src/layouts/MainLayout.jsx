import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { useAuth } from '../context/AuthContext';
import AddEventModal from '../components/AddEventModal';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme.colors.contentBackground};
    margin: 0;
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }
`;

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.aside`
  width: 260px;
  background-color: ${props => props.theme.colors.sidebar};
  border-right: 1px solid ${props => props.theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: 30px 20px;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: transform 0.3s ease-in-out;

  @media (max-width: 1024px) {
    transform: ${props => props.open ? 'translateX(0)' : 'translateX(-100%)'};
    box-shadow: ${props => props.open ? '10px 0 30px rgba(0,0,0,0.1)' : 'none'};
  }
`;

const Overlay = styled.div`
  display: none;
  @media (max-width: 1024px) {
    display: ${props => props.show ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0,0,0,0.3);
    z-index: 50;
  }
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 40px;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme.colors.secondary};
`;

const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 12A10 10 0 0 0 12 2v10z" fill="currentColor"/>
  </svg>
);

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

// Wrap NavItem with styled(NavLink) to get built-in active state logic
const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: ${props => props.theme.radius.md};
  color: ${props => props.theme.colors.textSecondary};
  background-color: transparent;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background-color: #F8F9FA;
  }
  
  &.active {
    color: ${props => props.theme.colors.primary};
    background-color: #EBF5FF;
    font-weight: 600;
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Important for grid responsiveness */

  @media (max-width: 1024px) {
    margin-left: 0;
  }
`;

const TopBar = styled.header`
  height: 80px;
  background-color: ${props => props.theme.colors.sidebar};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  position: sticky;
  top: 0;
  z-index: 40;

  @media (max-width: 600px) {
    padding: 0 20px;
  }
`;

const Hamburger = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.theme.colors.secondary};
  padding: 0;
  margin-right: 15px;

  @media (max-width: 1024px) {
    display: block;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  margin: 0 20px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 45px;
  background-color: #F3F4F6;
  border: none;
  border-radius: ${props => props.theme.radius.round};
  outline: none;
  font-size: 0.95rem;

  &::placeholder {
    color: #9CA3AF;
  }
`;

const SearchIcon = () => (
  <svg style={{ position: 'absolute', left: '16px', top: '12px', color: '#9CA3AF' }} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const NewEventBtn = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: ${props => props.theme.radius.sm};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &:hover { background-color: #0056b3; }

  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
`;

const MobileHeader = styled.div`
  display: none;
  @media (max-width: 1024px) {
    display: flex;
    align-items: center;
  }
`;

export default function MainLayout() {
  const { events, activeEvent, selectEvent, fetchEvents, searchQuery, setSearchQuery } = useBudget();
  const { isAdmin, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isEventsPage = location.pathname === '/events';
  const showSearch = location.pathname === '/events';

  const handleSelectEvent = (id) => {
    selectEvent(id);
    setSidebarOpen(false);
    navigate('/'); // Always redirect to home to show the new selected event layout
  };

  const handleEventAdded = (newEvent) => {
    fetchEvents();
    if (newEvent && newEvent._id) {
      selectEvent(newEvent._id);
    }
    navigate('/');
  };

  return (
    <AppContainer>
      <GlobalStyle />
      <Overlay show={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <Sidebar open={sidebarOpen}>
        <LogoArea>
          <LogoIcon />
          Set Budget
        </LogoArea>
        
        <div style={{ marginBottom: '30px' }}>
          <select 
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E0E0E0', fontSize: '16px' }}
            value={activeEvent?._id || ''} 
            onChange={(e) => handleSelectEvent(e.target.value)}
          >
            {events.length === 0 && <option value="">No Events</option>}
            {events.map(e => (
              <option key={e._id} value={e._id}>{e.name}</option>
            ))}
          </select>
        </div>

        <SidebarNav>
          <NavItem to="/" onClick={() => setSidebarOpen(false)} end><span style={{ fontSize: '1.2rem' }}>🏠</span> Home</NavItem>
          <NavItem to="/events" onClick={() => setSidebarOpen(false)}><span style={{ fontSize: '1.2rem' }}>📅</span> Events</NavItem>
          <NavItem to="/summary" onClick={() => setSidebarOpen(false)}><span style={{ fontSize: '1.2rem' }}>📊</span> Summary</NavItem>
          <NavItem to="/profile" onClick={() => setSidebarOpen(false)}><span style={{ fontSize: '1.2rem' }}>👤</span> Profile</NavItem>
          {isAdmin && (
            <NavItem to="/users" onClick={() => setSidebarOpen(false)}><span style={{ fontSize: '1.2rem' }}>👥</span> Users</NavItem>
          )}
        </SidebarNav>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            style={{ width: '100%', padding: '10px', background: 'transparent', border: '1px solid #E0E0E0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#DC2626' }}
          >
            Log Out
          </button>
        </div>
      </Sidebar>

      <MainContent>
        <TopBar>
          <MobileHeader>
            <Hamburger onClick={() => setSidebarOpen(true)}>☰</Hamburger>
            <LogoIcon />
          </MobileHeader>
          
          {showSearch && (
            <SearchContainer>
              <SearchIcon />
              <SearchInput 
                placeholder="Search Events..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </SearchContainer>
          )}

          {!isEventsPage && isAdmin && (
            <NewEventBtn onClick={() => setIsModalOpen(true)}>
              <span>+</span> New Event
            </NewEventBtn>
          )}
        </TopBar>

        <AddEventModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onEventAdded={handleEventAdded} 
        />

        {/* Dynamic Route Content */}
        <Outlet />
      </MainContent>
    </AppContainer>
  );
}

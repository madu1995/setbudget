import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const PageContainer = styled.div`
  padding: 40px;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 30px;
`;

const Card = styled.div`
  background: white;
  border-radius: ${props => props.theme.radius.lg};
  padding: 30px;
  box-shadow: ${props => props.theme.shadows.base};
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 30px;
`;

const SectionTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  color: ${props => props.theme.colors.secondary};
  border-bottom: 2px solid #F3F4F6;
  padding-bottom: 10px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 15px;
  margin-bottom: 10px;
`;

const Label = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-weight: 600;
`;

const Value = styled.span`
  color: ${props => props.theme.colors.textPrimary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radius.md};
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }
`;

const Button = styled.button`
  background-color: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #0056b3;
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: #9CA3AF;
    cursor: not-allowed;
    transform: none;
  }
`;

const Message = styled.p`
  padding: 12px;
  border-radius: ${props => props.theme.radius.md};
  font-weight: 500;
  margin-top: 10px;
  background-color: ${props => props.error ? '#FEE2E2' : '#D1FAE5'};
  color: ${props => props.error ? '#DC2626' : '#059669'};
  border: 1px solid ${props => props.error ? '#FECACA' : '#A7F3D0'};
`;

export default function Profile() {
  const { user, updateProfile, changePassword } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [profileMsg, setProfileMsg] = useState({ text: '', error: false });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', error: false });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const onUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', error: false });
    setIsSubmittingProfile(true);
    try {
      await updateProfile(profileData);
      setProfileMsg({ text: 'Profile updated successfully!', error: false });
      setIsEditingProfile(false);
    } catch (err) {
      setProfileMsg({ text: err.response?.data?.message || 'Failed to update profile', error: true });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const cancelEdit = () => {
    setProfileData({
      name: user?.name || '',
      phone: user?.phone || ''
    });
    setIsEditingProfile(false);
    setProfileMsg({ text: '', error: false });
  };

  const onChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', error: false });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', error: true });
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordMsg({ text: 'Password changed successfully!', error: false });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setIsChangingPassword(false), 2000);
    } catch (err) {
      setPasswordMsg({ text: err.response?.data?.message || 'Failed to change password', error: true });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordMsg({ text: '', error: false });
  };

  if (!user) return null;

  return (
    <PageContainer>
      <Title>My Profile</Title>

      <Card>
        <SectionTitle>Account Information</SectionTitle>
        <InfoGrid>
          <Label>Username:</Label>
          <Value>@{user.username}</Value>
          
          <Label>Role:</Label>
          <Value>
            <span style={{ 
              padding: '4px 10px', 
              borderRadius: '50px', 
              fontSize: '0.85rem',
              backgroundColor: user.role === 'admin' ? '#FEE2E2' : '#EBF5FF',
              color: user.role === 'admin' ? '#DC2626' : '#007BFF',
              fontWeight: '700'
            }}>
              {user.role.toUpperCase()}
            </span>
          </Value>
        </InfoGrid>
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1F2937' }}>Profile Details</h3>
          {!isEditingProfile && (
            <Button 
              onClick={() => setIsEditingProfile(true)}
              style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'transparent', color: '#007BFF', border: '1px solid #007BFF' }}
            >
              Edit Profile
            </Button>
          )}
        </div>
        
        {isEditingProfile ? (
          <Form onSubmit={onUpdateProfile}>
            <FormGroup>
              <Label>Full Name</Label>
              <Input 
                name="name" 
                value={profileData.name} 
                onChange={handleProfileChange} 
                placeholder="Your full name" 
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Phone Number</Label>
              <Input 
                name="phone" 
                value={profileData.phone} 
                onChange={handleProfileChange} 
                placeholder="Your phone number" 
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" disabled={isSubmittingProfile}>
                {isSubmittingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                onClick={cancelEdit} 
                style={{ backgroundColor: 'transparent', color: '#6B7280', border: '1px solid #D1D5DB' }}
              >
                Cancel
              </Button>
            </div>
            {profileMsg.text && <Message error={profileMsg.error}>{profileMsg.text}</Message>}
          </Form>
        ) : (
          <InfoGrid>
            <Label>Full Name:</Label>
            <Value>{user.name}</Value>
            
            <Label>Phone:</Label>
            <Value>{user.phone || 'Not provided'}</Value>
            {profileMsg.text && <Message error={profileMsg.error}>{profileMsg.text}</Message>}
          </InfoGrid>
        )}
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1F2937' }}>Security</h3>
          {!isChangingPassword && (
            <Button 
              onClick={() => setIsChangingPassword(true)}
              style={{ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: 'transparent', color: '#DC2626', border: '1px solid #DC2626' }}
            >
              Change Password
            </Button>
          )}
        </div>

        {isChangingPassword ? (
          <Form onSubmit={onChangePassword}>
            <FormGroup>
              <Label>Current Password</Label>
              <Input 
                type="password" 
                name="currentPassword" 
                value={passwordData.currentPassword} 
                onChange={handlePasswordChange} 
                placeholder="Enter current password" 
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>New Password</Label>
              <Input 
                type="password" 
                name="newPassword" 
                value={passwordData.newPassword} 
                onChange={handlePasswordChange} 
                placeholder="Enter new password" 
                required
              />
            </FormGroup>
            <FormGroup>
              <Label>Confirm New Password</Label>
              <Input 
                type="password" 
                name="confirmPassword" 
                value={passwordData.confirmPassword} 
                onChange={handlePasswordChange} 
                placeholder="Confirm new password" 
                required
              />
            </FormGroup>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button type="submit" disabled={isSubmittingPassword}>
                {isSubmittingPassword ? 'Updating...' : 'Update Password'}
              </Button>
              <Button 
                type="button" 
                onClick={cancelPasswordChange} 
                style={{ backgroundColor: 'transparent', color: '#6B7280', border: '1px solid #D1D5DB' }}
              >
                Cancel
              </Button>
            </div>
            {passwordMsg.text && <Message error={passwordMsg.error}>{passwordMsg.text}</Message>}
          </Form>
        ) : (
          <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>It's a good idea to use a strong password that you're not using elsewhere.</p>
        )}
      </Card>
    </PageContainer>
  );
}

import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppContext } from './store/appStore';
import { useTelegram } from './hooks/useTelegram';
import BottomNavBar from './components/BottomNavBar';
import ExplorePage from './pages/ExplorePage';
import CharacterDetailPage from './pages/CharacterDetailPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';

function AppRoutes() {
  const location = useLocation();
  const isChat = location.pathname.startsWith('/chat');
  const isDetail = location.pathname.startsWith('/role/');

  return (
    <>
      <Routes>
        <Route path="/" element={<ExplorePage />} />
        <Route path="/role/:roleId" element={<CharacterDetailPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/chat/:roleId" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      {!isChat && !isDetail && <BottomNavBar />}
    </>
  );
}

export default function App() {
  const { user } = useTelegram();
  const [currentRoleId, setCurrentRoleId] = useState<number | null>(null);

  return (
    <AppContext.Provider value={{ user, currentRoleId, setCurrentRoleId }}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppContext.Provider>
  );
}

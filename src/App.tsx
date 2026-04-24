/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SkillProvider } from './context/SkillContext';
import { ToolProvider } from './features/tools/context/ToolContext';
import { ToolsPage } from './features/tools/pages/ToolsPage';
import { Navbar } from './components/layout/Navbar';
import { Home } from './pages/Home';
import { Skills } from './pages/Skills';
import { CreateSkill } from './pages/CreateSkill';
import { SkillDetail } from './pages/SkillDetail';
import { RunSkill } from './pages/RunSkill';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <ToolProvider>
        <SkillProvider>
          <div className="min-h-screen flex flex-col font-sans bg-background text-on-background">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/create" element={<CreateSkill />} />
                <Route path="/skill/:id" element={<SkillDetail />} />
                <Route path="/skill/:id/run" element={<RunSkill />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </SkillProvider>
      </ToolProvider>
    </BrowserRouter>
  );
}


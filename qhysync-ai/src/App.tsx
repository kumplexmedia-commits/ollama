import React, { useState } from 'react';
import { useChat } from './hooks/useChat';
import { useSpeech } from './hooks/useSpeech';
import { useTheme } from './hooks/useTheme';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ArtifactsCanvas } from './components/ArtifactsCanvas';
import { PersonasModal } from './components/PersonasModal';
import { SettingsModal } from './components/SettingsModal';
import { AnalyticsPanel } from './components/AnalyticsPanel';

export const App: React.FC = () => {
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    settings,
    updateSettings,
    isGenerating,
    activeArtifact,
    setActiveArtifact,
    artifactsList,
    createNewSession,
    deleteSession,
    clearSession,
    togglePinSession,
    sendMessage,
    stopGeneration,
    toggleFeedback
  } = useChat();

  const {
    isListening,
    isSpeaking,
    transcript,
    startListening,
    stopListening,
    speakText,
    stopSpeaking
  } = useSpeech();

  useTheme(settings.theme);

  const [showPersonasModal, setShowPersonasModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#080d1a] text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={createNewSession}
        onDeleteSession={deleteSession}
        onTogglePinSession={togglePinSession}
        settings={settings}
        onUpdateSettings={updateSettings}
        onOpenPersonas={() => setShowPersonasModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAnalytics={() => setShowAnalyticsModal(true)}
        artifactsList={artifactsList}
        onSelectArtifact={(art) => setActiveArtifact(art)}
      />

      {/* Main Conversation Window */}
      <ChatWindow
        session={activeSession}
        settings={settings}
        onUpdateSettings={updateSettings}
        onSendMessage={sendMessage}
        onStopGeneration={stopGeneration}
        isGenerating={isGenerating}
        onClearSession={() => clearSession(activeSessionId)}
        onSelectArtifact={(art) => setActiveArtifact(art)}
        onToggleFeedback={toggleFeedback}
        isListening={isListening}
        onStartListening={startListening}
        onStopListening={stopListening}
        speechTranscript={transcript}
        onSpeakText={(text) => (isSpeaking ? stopSpeaking() : speakText(text, settings.ttsSpeed))}
        isSpeaking={isSpeaking}
      />

      {/* Artifacts Canvas Side Panel */}
      <ArtifactsCanvas
        artifact={activeArtifact}
        onClose={() => setActiveArtifact(null)}
      />

      {/* Modals & Overlays */}
      {showPersonasModal && (
        <PersonasModal
          activePersonaId={settings.personaId}
          onSelectPersona={(personaId) => updateSettings({ personaId })}
          onClose={() => setShowPersonasModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showAnalyticsModal && (
        <AnalyticsPanel
          sessions={sessions}
          onClose={() => setShowAnalyticsModal(false)}
        />
      )}
    </div>
  );
};

export default App;

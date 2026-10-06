import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Processes } from './components/Processes';
import { Resources } from './components/Resources';
import { Deadlock } from './components/Deadlock';
import { Alerts } from './components/Alerts';
import { Settings } from './components/Settings';
import { useSimulatedData } from './hooks/useSimulatedData';
import type { Page } from './types';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const {
    processes,
    metrics,
    history,
    alerts,
    deadlockStatus,
    resources,
    isMonitoring,
    toggleMonitoring,
    triggerDeadlock,
    clearDeadlock,
  } = useSimulatedData();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard metrics={metrics} history={history} processes={processes} deadlockStatus={deadlockStatus} />;
      case 'processes':
        return <Processes processes={processes} />;
      case 'resources':
        return <Resources metrics={metrics} history={history} />;
      case 'deadlock':
        return <Deadlock 
          deadlockStatus={deadlockStatus} 
          resources={resources}
          onTriggerDeadlock={triggerDeadlock}
          onClearDeadlock={clearDeadlock}
        />;
      case 'alerts':
        return <Alerts alerts={alerts} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard metrics={metrics} history={history} processes={processes} deadlockStatus={deadlockStatus} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isMonitoring={isMonitoring}
        onToggleMonitoring={toggleMonitoring}
      />
      <main className="flex-1 p-6 overflow-auto">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;

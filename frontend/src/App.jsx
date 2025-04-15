import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ScriptForm from './components/ScriptForm';
import ScriptList from './components/ScriptList';
import ScriptDialog from './components/ScriptDialog';
import ChangePassword from './components/ChangePassword';
import { motion } from 'framer-motion';
import { PlusIcon, ArrowPathIcon, KeyIcon } from '@heroicons/react/24/outline';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingScript, setEditingScript] = useState(null);

  const REFRESH_OPTIONS = [
    { label: 'Disabled', value: 0 },
    { label: '5s', value: 5000 },
    { label: '10s', value: 10000 },
    { label: '30s', value: 30000 },
  ];
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Modify API_BASE_URL configuration
  const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8080/api';

  useEffect(() => {
    fetchTasks();
    fetchScripts();
    let timer;
    if (refreshInterval > 0) {
      timer = setInterval(fetchTasks, refreshInterval);
    }

    // Cleanup on unmount
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [refreshInterval]);

  const getErrorMessage = async (response) => {
    try {
      const data = await response.json();
      return data.error || data.message || `HTTP error! status: ${response.status}`;
    } catch (e) {
      return `HTTP error! status: ${response.status}`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast.error(error.message);
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/scripts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setScripts(data);
    } catch (error) {
      toast.error(error.message);
      console.error('Error fetching scripts:', error);
    }
  };

  const handleAddScript = async (script) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/scripts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(script),
      });
      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      await fetchScripts();
      toast.success('Script created successfully');
      setIsScriptDialogOpen(false); // Close dialog on success
    } catch (error) {
      toast.error(error.message);
      throw error; // Re-throw to handle in the form
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunScript = async (scriptId) => {
    const runPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/scripts/${scriptId}/run`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await getErrorMessage(response);
          throw new Error(errorMessage);
        }
        await fetchTasks();
        return 'Script Submitted successfully';
      } catch (error) {
        await fetchTasks();
        throw new Error(error.message);
      }
    })();

    toast.promise(runPromise, {
      loading: 'Running script...',
      success: (message) => message,
      error: (err) => err.message,
    });
  };

  const handleDeleteScript = async (scriptId) => {
    const deletePromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/scripts/${scriptId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await getErrorMessage(response);
          throw new Error(errorMessage);
        }
        await fetchScripts();
        return 'Script deleted successfully';
      } catch (error) {
        throw new Error(error.message);
      }
    })();

    toast.promise(deletePromise, {
      loading: 'Deleting script...',
      success: (message) => message,
      error: (err) => err.message,
    });
  };

  const handleAddTask = async (task) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(task),
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const deletePromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
          method: 'DELETE',

          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await getErrorMessage(response);
          throw new Error(errorMessage);
        }
        await fetchTasks();
        return 'Task deleted successfully';
      } catch (error) {
        throw new Error(error.message);
      }
    })();

    toast.promise(deletePromise, {
      loading: 'Deleting task...',
      success: (message) => message,
      error: (err) => err.message,
    });
  };

  const handleToggleTask = async (taskName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskName}/toggle`, {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const handleEditScript = async (script) => {
    setEditingScript(script);
    setIsScriptDialogOpen(true);
  };

  const handleUpdateScript = async (updatedScript) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/scripts/${editingScript.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedScript),
      });
      if (!response.ok) {
        const errorMessage = await getErrorMessage(response);
        throw new Error(errorMessage);
      }
      await fetchScripts();
      toast.success('Script updated successfully');
      setIsScriptDialogOpen(false);
      setEditingScript(null);
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRerunTask = async (taskId) => {
    const rerunPromise = (async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/rerun`, {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          const errorMessage = await getErrorMessage(response);
          throw new Error(errorMessage);
        }
        await fetchTasks();
        return 'Task rerun started';
      } catch (error) {
        await fetchTasks();
        throw new Error(error.message);
      }
    })();

    toast.promise(rerunPromise, {
      loading: 'Starting task rerun...',
      success: (message) => message,
      error: (err) => err.message,
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Gogo Scheduler</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsChangePasswordDialogOpen(true)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <KeyIcon className="h-5 w-5 mr-2" />
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Scripts</h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setEditingScript(null);
                setIsScriptDialogOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Script
            </motion.button>
          </div>
          <ScriptList 
            scripts={scripts} 
            onDelete={handleDeleteScript}
            onRun={handleRunScript}
            onEdit={handleEditScript}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <div className="flex items-center space-x-2">
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="inline-flex items-center px-2 py-1 text-sm bg-transparent border border-gray-300 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {REFRESH_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.value === refreshInterval ? `↻ ${option.label}` : option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={fetchTasks}
                className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                title="Refresh manually"
              >
                <ArrowPathIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <TaskList tasks={tasks} onDelete={handleDeleteTask} onRerun={handleRerunTask} />
        </div>
      </div>

      <ScriptDialog
        isOpen={isScriptDialogOpen}
        onClose={() => {
          setIsScriptDialogOpen(false);
          setEditingScript(null);
        }}
        onSubmit={editingScript ? handleUpdateScript : handleAddScript}
        isLoading={isLoading}
        initialScript={editingScript}
      />

      <ChangePassword
        isOpen={isChangePasswordDialogOpen}
        onClose={() => setIsChangePasswordDialogOpen(false)}
      />

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </Layout>
  );
}

export default App; 
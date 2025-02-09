import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ScriptForm from './components/ScriptForm';
import ScriptList from './components/ScriptList';
import ScriptDialog from './components/ScriptDialog';
import { motion } from 'framer-motion';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  const [tasks, setTasks] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [isScriptDialogOpen, setIsScriptDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchScripts();
  }, []);

  const getErrorMessage = async (response) => {
    try {
      const data = await response.json();
      return data.error || data.message || `HTTP error! status: ${response.status}`;
    } catch (e) {
      return `HTTP error! status: ${response.status}`;
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:8080/tasks');
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
      const response = await fetch('http://localhost:8080/scripts');
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
      const response = await fetch('http://localhost:8080/scripts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        const response = await fetch(`http://localhost:8080/scripts/${scriptId}/run`, {
          method: 'POST',
        });
        if (!response.ok) {
          const errorMessage = await getErrorMessage(response);
          throw new Error(errorMessage);
        }
        return 'Script executed successfully';
      } catch (error) {
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
        const response = await fetch(`http://localhost:8080/scripts/${scriptId}`, {
          method: 'DELETE',
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
      const response = await fetch('http://localhost:8080/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        const response = await fetch(`http://localhost:8080/tasks/${taskId}`, {
          method: 'DELETE',
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
      const response = await fetch(`http://localhost:8080/tasks/${taskName}/toggle`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Scripts</h2>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsScriptDialogOpen(true)}
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
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Tasks</h2>
          <TaskList tasks={tasks} onDelete={handleDeleteTask} />
        </div>
      </div>

      <ScriptDialog
        isOpen={isScriptDialogOpen}
        onClose={() => setIsScriptDialogOpen(false)}
        onSubmit={handleAddScript}
        isLoading={isLoading}
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
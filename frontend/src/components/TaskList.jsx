import { useState } from 'react';
import TaskDetailDialog from './TaskDetailDialog';
import { TrashIcon, InformationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

function TaskList({ tasks, onDelete, onRerun }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'text-yellow-800 bg-yellow-100';
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'failed':
        return 'text-red-800 bg-red-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const handleShowDetail = (task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  return (
    <>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <li key={task.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium text-gray-900">{task.script_name}</h3>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 font-mono">{task.name}</p>
                      <div className="mt-2 space-y-1">
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                          <div>
                            <p>Last Run: {formatDate(task.last_run)}</p>
                            <p>Next Run: {formatDate(task.next_run)}</p>
                          </div>
                          <div>
                            <p>Created: {formatDate(task.created_at)}</p>
                            <p>Updated: {formatDate(task.updated_at)}</p>
                          </div>
                        </div>
                        {task.error && (
                          <p className="text-sm text-red-600 mt-2">
                            Error: {task.error}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleShowDetail(task)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <InformationCircleIcon className="h-4 w-4 mr-1.5" />
                        Details
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <TrashIcon className="h-4 w-4 mr-1.5" />
                        Delete
                      </button>
                      <button
                        onClick={() => onRerun(task.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                        Rerun
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <TaskDetailDialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        task={selectedTask}
      />
    </>
  );
}

export default TaskList; 
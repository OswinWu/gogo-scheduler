import { useState } from 'react';

function TaskForm({ onSubmit }) {
  const [task, setTask] = useState({
    name: '',
    command: '',
    schedule: '',
    timeout: 0
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(task);
    setTask({ name: '', command: '', schedule: '', timeout: 0 });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700">Task Name</label>
        <input
          type="text"
          value={task.name}
          onChange={(e) => setTask({ ...task, name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Command</label>
        <input
          type="text"
          value={task.command}
          onChange={(e) => setTask({ ...task, command: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Schedule (Cron Expression)</label>
        <input
          type="text"
          value={task.schedule}
          onChange={(e) => setTask({ ...task, schedule: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Timeout (seconds)</label>
        <input
          type="number"
          value={task.timeout}
          onChange={(e) => setTask({ ...task, timeout: parseInt(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <button
        type="submit"
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Add Task
      </button>
    </form>
  );
}

export default TaskForm; 
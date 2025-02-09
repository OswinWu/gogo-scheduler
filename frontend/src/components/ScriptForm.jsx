import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function ScriptForm({ onSubmit, isLoading, initialScript }) {
  const [script, setScript] = useState(initialScript || {
    name: '',
    content: '',
    schedule: '',
    type: 'shell',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialScript) {
      setScript(initialScript);
    }
  }, [initialScript]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit(script);
      setScript({ name: '', content: '', schedule: '', type: 'shell' });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Script Name</label>
        <input
          type="text"
          value={script.name}
          onChange={(e) => setScript({ ...script, name: e.target.value })}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Script Type</label>
        <select
          value={script.type}
          onChange={(e) => setScript({ ...script, type: e.target.value })}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
        >
          <option value="shell">Shell Script</option>
          <option value="python">Python Script</option>
          <option value="nodejs">Node.js Script</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Script Content</label>
        <div className="mt-1 relative rounded-lg border border-gray-300 shadow-sm">
          <textarea
            value={script.content}
            onChange={(e) => setScript({ ...script, content: e.target.value })}
            rows={4}
            className="block w-full rounded-lg border-0 bg-transparent focus:ring-2 focus:ring-indigo-500"
            required
            placeholder={script.type === 'shell' ? '#!/bin/bash\necho "Hello World"' :
                       script.type === 'python' ? 'print("Hello World")' :
                       'console.log("Hello World")'}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Schedule (Cron Expression)</label>
        <div className="mt-1 relative rounded-lg">
          <input
            type="text"
            value={script.schedule}
            onChange={(e) => setScript({ ...script, schedule: e.target.value })}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="*/5 * * * *"
          />
          <p className="mt-2 text-sm text-gray-500">Leave empty for manual execution only</p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          ) : (
            'Create Script'
          )}
        </motion.button>
      </div>
    </form>
  );
}

export default ScriptForm; 
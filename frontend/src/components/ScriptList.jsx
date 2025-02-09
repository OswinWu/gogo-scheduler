import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon, PlayIcon } from '@heroicons/react/24/outline';

function ScriptList({ scripts, onDelete, onRun, onEdit }) {
  return (
    <div className="mt-8 space-y-4">
      <AnimatePresence>
        {scripts.map((script) => (
          <motion.div
            key={script.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-medium text-gray-900">{script.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {script.schedule || 'Manual Only'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onEdit(script)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <PencilIcon className="h-4 w-4 mr-1.5" />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onRun(script.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <PlayIcon className="h-4 w-4 mr-1.5" />
                    Run Now
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onDelete(script.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <TrashIcon className="h-4 w-4 mr-1.5" />
                    Delete
                  </motion.button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <pre className="whitespace-pre-wrap break-words text-gray-700">
                  {script.content}
                </pre>
              </div>
              {script.last_run && (
                <p className="mt-4 text-sm text-gray-500 flex items-center">
                  <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Last Run: {new Date(script.last_run).toLocaleString()}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ScriptList; 
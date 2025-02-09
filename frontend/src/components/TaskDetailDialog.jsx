import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

function TaskDetailDialog({ isOpen, onClose, task }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="div"
                  className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50"
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Task Details: {task?.script_name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {task?.name}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>
                <div className="px-6 py-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Task Name</p>
                        <p className="font-medium font-mono">{task?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Status</p>
                        <p className="font-medium">{task?.status}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Script ID</p>
                        <p className="font-medium">{task?.script_id}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Created At</p>
                        <p className="font-medium">{formatDate(task?.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Updated At</p>
                        <p className="font-medium">{formatDate(task?.updated_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Run</p>
                        <p className="font-medium">{formatDate(task?.last_run)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Next Run</p>
                        <p className="font-medium">{formatDate(task?.next_run)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Output</p>
                        <p className="font-medium">{task?.output}</p>
                      </div>
                    </div>

                    {task?.output && (
                      <div>
                        <p className="text-gray-500 mb-2">Output</p>
                        <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                          {task.output}
                        </pre>
                      </div>
                    )}

                    {task?.error && (
                      <div>
                        <p className="text-red-500 mb-2">Error</p>
                        <pre className="bg-red-50 p-4 rounded-lg overflow-x-auto text-sm font-mono text-red-600 whitespace-pre-wrap">
                          {task.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default TaskDetailDialog; 
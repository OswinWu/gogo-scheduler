import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import ScriptForm from './ScriptForm';
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

function ScriptDialog({ isOpen, onClose, onSubmit, isLoading, initialScript }) {
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
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 px-6 py-4 border-b border-gray-200 bg-gray-50"
                >
                  {initialScript ? 'Edit Script' : 'Add New Script'}
                </Dialog.Title>
                <div className="p-6">
                  <ScriptForm onSubmit={onSubmit} isLoading={isLoading} initialScript={initialScript} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ScriptDialog; 
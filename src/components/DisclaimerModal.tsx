import { X } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export default function DisclaimerModal({ isOpen, onAccept }: DisclaimerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full border-2 border-blue-500 shadow-2xl">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Important Notice</h2>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-gray-300 text-base leading-relaxed">
              Puzzle2Profit provides interactive educational tools for learning AI automation. Participation requires consistent effort; no financial outcomes are promised or guaranteed.
            </p>
            <p className="text-gray-300 text-base leading-relaxed">
              User experiences vary and do not predict results. This is not investment or business advice—seek qualified professionals.
            </p>
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-4 mt-6">
              <p className="text-yellow-400 font-semibold text-sm">
                By proceeding with checkout, you acknowledge that this is an educational platform and understand that no income guarantees are provided.
              </p>
            </div>
          </div>

          <button
            onClick={onAccept}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

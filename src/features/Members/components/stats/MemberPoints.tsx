import { useState } from "react";

interface MemberPointsProps {
    points: number;
    onPointsChange: (newPoints: number) => void;
    readOnly?: boolean;
}

export default function MemberPoints({ points, onPointsChange, readOnly = false }: MemberPointsProps) {
    const [pointsInput, setPointsInput] = useState<string>('');

    const handleAddPoints = () => {
        const val = parseInt(pointsInput);
        if (!isNaN(val)) {
            onPointsChange(points + val);
            setPointsInput('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Points</h3>
                <span className="text-3xl font-bold text-(--color-myPrimary)">{points}</span>
            </div>

            {!readOnly && (
                <div className="flex gap-2">
                    <input 
                        type="number" 
                        placeholder="Add/Remove points..." 
                        value={pointsInput}
                        onChange={(e) => setPointsInput(e.target.value)}
                        className="flex-1 border rounded px-3 py-2 text-sm"
                    />
                    <button 
                        onClick={handleAddPoints}
                        disabled={!pointsInput}
                        className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium disabled:opacity-50 hover:bg-gray-800"
                    >
                        Update
                    </button>
                </div>
            )}
        </div>
    );
}

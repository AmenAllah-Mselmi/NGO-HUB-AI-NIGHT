
import { Layout, List as ListIcon } from "lucide-react";

interface ViewToggleProps {
    view: 'list' | 'kanban';
    onViewChange: (view: 'list' | 'kanban') => void;
}

export const ViewToggle = ({ view, onViewChange }: ViewToggleProps) => (
    <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-xl w-fit">
        <button 
            onClick={() => onViewChange('list')} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white shadow-sm text-(--color-myPrimary)' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <ListIcon className="w-4 h-4" /> List
        </button>
        <button 
            onClick={() => onViewChange('kanban')} 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-(--color-myPrimary)' : 'text-gray-500 hover:text-gray-700'}`}
        >
            <Layout className="w-4 h-4" /> Kanban
        </button>
    </div>
);

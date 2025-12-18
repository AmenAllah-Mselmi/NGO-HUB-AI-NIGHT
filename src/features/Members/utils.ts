


export const getRankColor = (tier: string): string => {
    switch (tier) {
        case 'Senator': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Leader': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'Active Member': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Member': return 'bg-green-100 text-green-800 border-green-200';
        case 'Guest': return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'new-member': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const getValidationStatusColor = (isValidated: boolean): string => {
    return isValidated 
        ? 'bg-green-100 text-green-800 border-green-200' 
        : 'bg-red-100 text-red-800 border-red-200';
};

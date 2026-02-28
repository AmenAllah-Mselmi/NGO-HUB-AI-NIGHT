import { useState, useEffect, useRef } from 'react';
import { FileText, Download, Upload, Trash2, File as FileIcon, Image as ImageIcon, FileArchive, Loader, Shield } from 'lucide-react';
import type { TeamDocument } from '../types';
import { getTeamDocuments, uploadTeamDocumentFile, deleteTeamDocument } from '../services/teams.service';
import { toast } from 'sonner';

interface TeamDocumentsProps {
    teamId: string;
    canManage: boolean;
    currentUserId?: string;
}

export default function TeamDocuments({ teamId, canManage, currentUserId }: TeamDocumentsProps) {
    const [documents, setDocuments] = useState<TeamDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (teamId) loadDocuments();
    }, [teamId]);

    const loadDocuments = async () => {
        try {
            setIsLoading(true);
            const data = await getTeamDocuments(teamId);
            setDocuments(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load documents");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentUserId) return;

        // Basic validation: max 50MB per file for example
        if (file.size > 50 * 1024 * 1024) {
            toast.error("File size cannot exceed 50MB");
            return;
        }

        try {
            setIsUploading(true);
            toast.promise(uploadTeamDocumentFile(teamId, currentUserId, file), {
                loading: 'Uploading document...',
                success: () => {
                    loadDocuments();
                    return 'Document uploaded successfully!';
                },
                error: 'Failed to upload document'
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDelete = async (doc: TeamDocument) => {
        if (!confirm(`Are you sure you want to delete "${doc.file_name}"?`)) return;

        try {
            await deleteTeamDocument(doc.id, doc.file_url);
            toast.success("Document deleted");
            loadDocuments();
        } catch (error) {
            toast.error("Failed to delete document");
        }
    };

    const formatBytes = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        if (type.match(/(jpg|jpeg|png|gif|webp|svg)/i)) return <ImageIcon className="w-6 h-6 text-blue-500" />;
        if (type.match(/(zip|rar|tar|gz)/i)) return <FileArchive className="w-6 h-6 text-amber-500" />;
        if (type.match(/(pdf)/i)) return <FileText className="w-6 h-6 text-red-500" />;
        return <FileIcon className="w-6 h-6 text-gray-500" />;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex justify-center">
                <span className="w-8 h-8 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-black flex items-center gap-2 text-gray-900">
                        <FileText className="w-6 h-6 text-indigo-500" />
                        Team Documents
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Shared files and resources for the project.</p>
                </div>

                <div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading || !currentUserId}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-black uppercase tracking-widest rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        {isUploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                </div>
            </div>

            {documents.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                    <FileIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-900">No documents uploaded</p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">Upload files, PDFs, or images that your team needs access to.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => {
                        const canDelete = canManage || doc.member_id === currentUserId;

                        return (
                            <div key={doc.id} className="group flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-indigo-200 bg-white hover:bg-indigo-50/30 transition-all shadow-sm">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shadow-sm border border-gray-100 group-hover:bg-white transition-colors shrink-0">
                                        {getFileIcon(doc.file_type)}
                                    </div>
                                    <div className="min-w-0 pr-2">
                                        <h3 className="text-sm font-bold text-gray-900 truncate leading-tight" title={doc.file_name}>{doc.file_name}</h3>
                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                            <span>{doc.file_size_bytes ? formatBytes(doc.file_size_bytes) : 'Unknown'}</span>
                                            <span>•</span>
                                            <span className="truncate">{doc.uploader?.fullname || 'Unknown User'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity pl-2">
                                    <a
                                        href={doc.file_url}
                                        download={doc.file_name}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 text-gray-400 bg-white border border-gray-200 shadow-sm hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 rounded-lg transition-colors"
                                        title="Download"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(doc)}
                                            className="p-2 text-gray-400 bg-white border border-gray-200 shadow-sm hover:text-red-600 hover:border-red-300 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete file"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!canManage && (
                <div className="mt-6 flex items-start gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    <Shield className="w-4 h-4 text-gray-400 shrink-0" />
                    <p>You can only delete files that you uploaded. Admins can delete any file.</p>
                </div>
            )}
        </div>
    );
}

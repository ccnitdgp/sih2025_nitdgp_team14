
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, Clock, XCircle, FileText, Loader2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseApp, useUser } from '@/firebase';
import { DocumentReference, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const verificationItems = [
    { id: 'birthCertificate', label: 'Birth Certificate', required: true },
    { id: 'addressProof', label: 'Light Bill (Address Proof)', required: true },
];

const StatusBadge = ({ status }) => {
    switch (status) {
        case 'Verified':
            return <Badge variant="default" className="bg-green-500 hover:bg-green-600"><CheckCircle className="mr-1 h-3 w-3" />Verified</Badge>;
        case 'Pending':
            return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
        case 'Rejected':
            return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
        default:
            return <Badge variant="outline">Not Uploaded</Badge>;
    }
};

const DocumentItem = ({ label, status, onUpload, isRequired, isUploading, currentUploadingDoc, docUrl }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isThisItemUploading = isUploading && currentUploadingDoc === label;
    const [viewingDocumentUrl, setViewingDocumentUrl] = useState<string | null>(null);

    return (
        <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 border rounded-md">
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <p className="font-medium">{label} {isRequired && <span className="text-destructive">*</span>}</p>
                        <StatusBadge status={status} />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {docUrl && (
                         <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => setViewingDocumentUrl(docUrl)}
                        >
                            View <ExternalLink className="ml-2 h-4 w-4"/>
                        </Button>
                    )}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden"
                        accept="image/*,.pdf"
                        onChange={(e) => e.target.files && onUpload(e.target.files[0])}
                        disabled={isUploading}
                    />
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isThisItemUploading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Upload className="mr-2 h-4 w-4" />
                        )}
                        {isThisItemUploading ? 'Uploading...' : (status === 'Not Uploaded' ? 'Upload' : 'Re-upload')}
                    </Button>
                </div>
            </div>
             <Dialog open={!!viewingDocumentUrl} onOpenChange={() => setViewingDocumentUrl(null)}>
                <DialogContent className="max-w-3xl h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Document Viewer</DialogTitle>
                        <DialogDescription>Review the uploaded document below.</DialogDescription>
                    </DialogHeader>
                     {viewingDocumentUrl && viewingDocumentUrl.startsWith('http') && (
                        <div className="mt-4 flex-grow h-full">
                            {viewingDocumentUrl.toLowerCase().includes('.pdf') ? (
                                 <iframe
                                    src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingDocumentUrl)}&embedded=true`}
                                    className="h-full w-full"
                                    title="Document viewer"
                                />
                            ) : (
                                <img
                                    src={viewingDocumentUrl}
                                    alt="Verification document"
                                    className="max-h-full w-full object-contain"
                                />
                            )}
                        </div>
                     )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export function DocumentManager({ userProfile, userDocRef }: { userProfile: any, userDocRef: DocumentReference | null }) {
    const { toast } = useToast();
    const { user } = useUser();
    const firebaseApp = useFirebaseApp();
    const [isUploading, setIsUploading] = useState(false);
    const [currentUploadingDoc, setCurrentUploadingDoc] = useState<string | null>(null);

    const handleUpload = async (docType: string, file: File) => {
        if (!userDocRef || !user || !firebaseApp) return;

        setIsUploading(true);
        setCurrentUploadingDoc(docType);

        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, `user-documents/${user.uid}/${docType}-${Date.now()}-${file.name}`);
        
        toast({
            title: 'Uploading Document...',
            description: `${file.name} is being uploaded.`,
        });

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            null,
            (error) => {
                console.error("Upload failed:", error);
                toast({
                    variant: "destructive",
                    title: "Upload Failed",
                    description: "Could not upload the selected file. Please try again.",
                });
                setIsUploading(false);
                setCurrentUploadingDoc(null);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    
                    const updateData = {
                        [`verification.${docType}`]: {
                            status: 'Pending',
                            url: downloadURL,
                        }
                    };

                    await updateDoc(userDocRef, updateData);
                    
                    toast({
                        title: 'Document Submitted',
                        description: `${file.name} has been submitted.`,
                    });
                } catch (error) {
                    console.error("Failed to get download URL or update Firestore:", error);
                     toast({
                        variant: "destructive",
                        title: "Update Failed",
                        description: "File uploaded, but failed to update profile.",
                    });
                } finally {
                    setIsUploading(false);
                    setCurrentUploadingDoc(null);
                }
            }
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Documents</CardTitle>
                <CardDescription>
                    Upload and manage your verification documents.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {verificationItems.map((item) => (
                    <DocumentItem
                        key={item.id}
                        label={item.label}
                        isRequired={item.required}
                        status={userProfile?.verification?.[item.id]?.status || 'Not Uploaded'}
                        docUrl={userProfile?.verification?.[item.id]?.url}
                        onUpload={(file) => handleUpload(item.id, file)}
                        isUploading={isUploading}
                        currentUploadingDoc={currentUploadingDoc === item.id ? item.label : null}
                    />
                ))}
            </CardContent>
        </Card>
    );
}


'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, Clock, XCircle, FileText, ShieldCheck, QrCode, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebaseApp } from '@/firebase';
import { DocumentReference, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const verificationItems = [
    { id: 'medicalDegree', label: 'Medical Degree Certificate', required: true },
    { id: 'internshipCertificate', label: 'Internship Completion Certificate', required: true },
    { id: 'registrationCertificate', label: 'Medical Council Registration', required: true },
    { id: 'identityProof', label: 'Identity Proof (Govt. Issued)', required: true },
    { id: 'photograph', label: 'Passport-size Photograph', required: false },
    { id: 'goodStandingCertificate', label: 'Good Standing Certificate', required: false },
    { id: 'specializationCertificate', label: 'Specialization Certificate (if applicable)', required: false },
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

const VerificationItem = ({ label, status, onUpload, isRequired, isUploading, currentUploadingDoc }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isThisItemUploading = isUploading && currentUploadingDoc === label;

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-4 border rounded-md">
            <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                    <p className="font-medium">{label} {isRequired && <span className="text-destructive">*</span>}</p>
                    <StatusBadge status={status} />
                </div>
            </div>
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
    );
};

export function VerificationCenter({ publicProfile, doctorPublicProfileRef }: { publicProfile: any, doctorPublicProfileRef: DocumentReference | null }) {
    const { toast } = useToast();
    const firebaseApp = useFirebaseApp();
    const [isUploading, setIsUploading] = useState(false);
    const [currentUploadingDoc, setCurrentUploadingDoc] = useState<string | null>(null);

    const handleUpload = async (docType: string, file: File) => {
        if (!doctorPublicProfileRef || !firebaseApp) return;

        setIsUploading(true);
        setCurrentUploadingDoc(docType);

        const storage = getStorage(firebaseApp);
        const storageRef = ref(storage, `doctor-verification/${doctorPublicProfileRef.id}/${docType}-${file.name}`);
        
        toast({
            title: 'Uploading Document...',
            description: `${file.name} is being uploaded.`,
        });

        try {
            // Step 1: Await the file upload to complete
            const snapshot = await uploadBytes(storageRef, file);
            
            // Step 2: Await getting the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            // Step 3: Await the Firestore document update with the correct URL
            const updateData = {
                [`verification.${docType}`]: {
                    status: 'Pending',
                    url: downloadURL,
                }
            };
            await updateDoc(doctorPublicProfileRef, updateData);
            
            toast({
                title: 'Document Submitted',
                description: `${file.name} has been submitted for verification.`,
            });
        } catch (error) {
            console.error("Upload failed:", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Could not upload the selected file. Please try again.",
            });
        } finally {
            setIsUploading(false);
            setCurrentUploadingDoc(null);
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                        <CardTitle>Verification Center</CardTitle>
                    </div>
                    <CardDescription>
                        Submit your documents to get a verified badge on your profile. This builds trust with patients.
                    </CardDescription>
                </div>
                 <Button variant="default">
                    <QrCode className="mr-2 h-4 w-4" />
                    Scan QR Code
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {verificationItems.map((item) => (
                    <VerificationItem
                        key={item.id}
                        label={item.label}
                        isRequired={item.required}
                        status={publicProfile?.verification?.[item.id]?.status || 'Not Uploaded'}
                        onUpload={(file) => handleUpload(item.id, file)}
                        isUploading={isUploading}
                        currentUploadingDoc={currentUploadingDoc === item.id ? item.label : null}
                    />
                ))}
            </CardContent>
        </Card>
    );
}

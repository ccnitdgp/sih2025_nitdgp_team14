
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, Clock, XCircle, FileText, ShieldCheck, QrCode, Loader2, Camera, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase';
import { DocumentReference } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
        case 'Suspended':
            return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-foreground"><AlertTriangle className="mr-1 h-3 w-3" />Suspended</Badge>;
        default:
            return <Badge variant="outline">Not Uploaded</Badge>;
    }
};

const VerificationItem = ({ label, status, onUpload, isRequired }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                onChange={(e) => e.target.files && onUpload(e.target.files[0])}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {status === 'Not Uploaded' ? 'Upload' : 'Re-upload'}
            </Button>
        </div>
    );
};


const QrScannerDialog = ({ isOpen, onOpenChange }) => {
    const [scanState, setScanState] = useState<'scanning' | 'failed' | 'success'>('scanning');

    useEffect(() => {
        if (isOpen) {
            setScanState('scanning');
            // Simulate scanning process
            const timer = setTimeout(() => {
                // Simulate a failure for demonstration purposes
                setScanState(Math.random() > 0.5 ? 'failed' : 'success');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><QrCode/> Scan Certificate QR Code</DialogTitle>
                    <DialogDescription>Position the QR code on the certificate within the frame.</DialogDescription>
                </DialogHeader>
                <div className="aspect-square w-full rounded-lg bg-black flex items-center justify-center p-4">
                    {scanState === 'scanning' && (
                        <div className="flex flex-col items-center gap-4 text-white">
                            <Camera className="h-16 w-16" />
                            <p>Simulating camera view...</p>
                            <Loader2 className="h-8 w-8 animate-spin"/>
                        </div>
                    )}
                    {scanState === 'failed' && (
                         <div className="flex flex-col items-center gap-4 text-center text-white">
                            <AlertTriangle className="h-16 w-16 text-destructive" />
                            <p className="font-semibold">QR Code Verification Failed</p>
                            <p className="text-sm text-muted-foreground">Could not verify the document automatically. Please proceed with a manual document upload.</p>
                             <Button onClick={() => onOpenChange(false)}>Close</Button>
                        </div>
                    )}
                    {scanState === 'success' && (
                         <div className="flex flex-col items-center gap-4 text-center text-white">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                            <p className="font-semibold">Verification Successful!</p>
                            <p className="text-sm text-muted-foreground">The document details have been automatically fetched and updated.</p>
                             <Button onClick={() => onOpenChange(false)}>Done</Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}


export function VerificationCenter({ publicProfile, doctorPublicProfileRef }: { publicProfile: any, doctorPublicProfileRef: DocumentReference | null }) {
    const { toast } = useToast();
    const [isScannerOpen, setIsScannerOpen] = useState(false);

    const handleUpload = (docType: string, file: File) => {
        if (!doctorPublicProfileRef) return;
        // In a real app, this would upload the file to Firebase Storage and get a URL.
        // For now, we'll just update the status to "Pending".
        console.log(`Uploading ${file.name} for ${docType}`);
        
        const updateData = {
            [`verification.${docType}`]: {
                status: 'Pending',
                url: '#placeholder', // URL from storage would go here
            }
        };

        updateDocumentNonBlocking(doctorPublicProfileRef, updateData);
        
        toast({
            title: 'Document Uploaded',
            description: `${file.name} has been submitted for verification.`,
        });
    };

    return (
        <>
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
                 <Button variant="default" onClick={() => setIsScannerOpen(true)}>
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
                    />
                ))}
            </CardContent>
        </Card>
        <QrScannerDialog isOpen={isScannerOpen} onOpenChange={setIsScannerOpen} />
        </>
    );
}

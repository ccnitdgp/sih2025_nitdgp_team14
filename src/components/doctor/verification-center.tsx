
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, CheckCircle, Clock, XCircle, FileText, ShieldCheck, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateDocumentNonBlocking } from '@/firebase';
import { DocumentReference } from 'firebase/firestore';

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
                accept="image/*,.pdf"
                onChange={(e) => e.target.files && onUpload(e.target.files[0])}
            />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                {status === 'Not Uploaded' ? 'Upload' : 'Re-upload'}
            </Button>
        </div>
    );
};

// This function reads the file as a data URI.
async function getFileDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

export function VerificationCenter({ publicProfile, doctorPublicProfileRef }: { publicProfile: any, doctorPublicProfileRef: DocumentReference | null }) {
    const { toast } = useToast();

    const handleUpload = async (docType: string, file: File) => {
        if (!doctorPublicProfileRef) return;
        
        toast({
            title: 'Uploading Document...',
            description: `${file.name} is being uploaded.`,
        });

        try {
            // Get the file content as a data URI
            const fileUrl = await getFileDataUri(file);

            const updateData = {
                [`verification.${docType}`]: {
                    status: 'Pending',
                    url: fileUrl, // Use the data URI
                }
            };

            // Use the non-blocking update
            await updateDocumentNonBlocking(doctorPublicProfileRef, updateData);
            
            toast({
                title: 'Document Submitted',
                description: `${file.name} has been submitted for verification.`,
            });
        } catch (error) {
            console.error("Upload failed:", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Could not upload the selected file.",
            });
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
                    />
                ))}
            </CardContent>
        </Card>
    );
}

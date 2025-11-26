
'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'react-qr-code';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { QrCode, Download } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export function VirtualIdCard({ user, userProfile }) {
  const [qrUrl, setQrUrl] = useState('');
  const qrCodeRef = useRef(null);

  useEffect(() => {
    if (user?.uid) {
      const url = `${window.location.origin}/doctor-dashboard/patient/${user.uid}`;
      setQrUrl(url);
    }
  }, [user]);

  const downloadQRCode = () => {
    const svg = qrCodeRef.current;
    if (!svg) return;

    // Clone the SVG to avoid modifying the original
    const svgClone = svg.cloneNode(true) as SVGSVGElement;
    svgClone.setAttribute("width", "300");
    svgClone.setAttribute("height", "300");


    const svgData = new XMLSerializer().serializeToString(svgClone);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 300;
    canvas.height = 300;

    const img = document.createElement('img');
    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = 'swasthya-virtual-id-qr.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  if (!userProfile || !user) {
      return (
        <Card>
            <CardContent className="pt-6">
                 <Skeleton className="h-8 w-3/4 mb-4" />
                 <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                 <Skeleton className="h-6 w-1/2 mx-auto mt-4" />
                 <Skeleton className="h-4 w-3/4 mx-auto mt-2" />
                 <Skeleton className="h-[140px] w-[140px] mx-auto mt-4" />
            </CardContent>
        </Card>
      )
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <QrCode className="h-6 w-6 text-primary" />
          <CardTitle>Virtual ID Card</CardTitle>
        </div>
        <CardDescription>
          Present this QR code to your doctor for quick access to your records.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center gap-4">
        <Avatar className="h-24 w-24 border-2 border-primary">
          <AvatarImage src={user?.photoURL ?? `https://picsum.photos/seed/${'user?.uid'}/200`} />
          <AvatarFallback className="text-3xl">
            {userProfile?.firstName?.charAt(0)}
            {userProfile?.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="font-semibold text-lg">
          {userProfile.firstName} {userProfile.lastName}
        </div>
        
        {qrUrl && (
          <div className="bg-white p-3 rounded-md border shadow-inner inline-block">
             <QRCode
                value={qrUrl}
                size={128}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="L"
                ref={qrCodeRef}
             />
          </div>
        )}
        <Button onClick={downloadQRCode} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download QR
        </Button>
      </CardContent>
    </Card>
  );
}

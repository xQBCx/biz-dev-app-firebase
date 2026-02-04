import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Video, Mic, MicOff, VideoOff, Phone, Camera, Pencil, FileText, MessageSquare } from "lucide-react";
import { useState } from "react";

export default function ExpertSession() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Session #{id?.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">Remote Triage Session</p>
        </div>
      </div>

      <div className="flex-1 grid gap-4 lg:grid-cols-4">
        {/* Video Area */}
        <div className="lg:col-span-3 flex flex-col">
          {/* Main video */}
          <div className="flex-1 relative bg-black rounded-lg overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center">
                <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg opacity-75">Waiting for customer...</p>
              </div>
            </div>

            {/* Local video (PIP) */}
            <div className="absolute bottom-4 right-4 w-48 aspect-video bg-muted rounded-lg border-2 border-border flex items-center justify-center">
              <Video className="h-8 w-8 text-muted-foreground" />
            </div>

            {/* Annotation tools */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button variant="secondary" size="icon">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="icon">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 py-4">
            <Button
              variant={audioOn ? "outline" : "destructive"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setAudioOn(!audioOn)}
            >
              {audioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </Button>

            <Button
              variant={videoOn ? "outline" : "destructive"}
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => setVideoOn(!videoOn)}
            >
              {videoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
            </Button>

            <Button
              variant="destructive"
              size="icon"
              className="h-12 w-12 rounded-full"
              onClick={() => navigate(-1)}
            >
              <Phone className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 overflow-y-auto">
          {/* Issue Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p className="text-muted-foreground">No issue details available</p>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Session Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full h-32 text-sm bg-muted rounded-lg p-2 resize-none"
                placeholder="Take notes during the session..."
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full">
                Create Work Order
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                Schedule Follow-up
              </Button>
              <Button size="sm" className="w-full">
                Mark Resolved
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
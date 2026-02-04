import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Mic, MicOff, VideoOff, Phone, MessageSquare, Camera, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { XRepairxLogo } from "@/components/XRepairxLogo";

export default function JoinSession() {
  const { sessionId } = useParams();
  const [joined, setJoined] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [audioOn, setAudioOn] = useState(true);

  if (!joined) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <XRepairxLogo size="sm" />
            </Link>
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Join Remote Session</CardTitle>
              <CardDescription>
                You're about to join a video call with a remote expert
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview */}
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button
                  variant={videoOn ? "outline" : "destructive"}
                  size="icon"
                  onClick={() => setVideoOn(!videoOn)}
                >
                  {videoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant={audioOn ? "outline" : "destructive"}
                  size="icon"
                  onClick={() => setAudioOn(!audioOn)}
                >
                  {audioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>

              <Button className="w-full" size="lg" onClick={() => setJoined(true)}>
                Join Session
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Session ID: {sessionId}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Video Area */}
      <div className="flex-1 relative bg-black">
        {/* Remote video (main) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-center">
            <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg opacity-75">Connecting to remote expert...</p>
          </div>
        </div>

        {/* Local video (PIP) */}
        <div className="absolute bottom-4 right-4 w-48 aspect-video bg-muted rounded-lg border-2 border-border flex items-center justify-center">
          <Video className="h-8 w-8 text-muted-foreground" />
        </div>

        {/* Issue context panel */}
        <div className="absolute top-4 left-4 bg-card/90 backdrop-blur rounded-lg p-4 max-w-xs">
          <h3 className="font-semibold text-sm mb-2">Issue Details</h3>
          <p className="text-xs text-muted-foreground">
            HVAC not cooling properly in Unit 204
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex items-center justify-center gap-4">
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
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
          >
            <Camera className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={() => setJoined(false)}
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, Camera, CheckCircle, MapPin, User, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TechWorkOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Work Order #{id?.slice(0, 8)}</h1>
          <p className="text-muted-foreground">View details and take action</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Actions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Status</CardTitle>
                <Badge>New</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button className="flex-1">
                  Start Work
                </Button>
                <Button variant="outline">
                  <Video className="h-4 w-4 mr-2" />
                  Call Expert
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Issue Details */}
          <Card>
            <CardHeader>
              <CardTitle>Issue Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                <p className="mt-1">No work order data available</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">AI Triage Summary</h4>
                <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                  No AI analysis available yet
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Photos & Media</CardTitle>
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No photos uploaded</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Asset Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Asset
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No asset linked</p>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No location set</p>
              <Button variant="outline" size="sm" className="w-full mt-4">
                Get Directions
              </Button>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Requester
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">No contact info</p>
            </CardContent>
          </Card>

          {/* Completion */}
          <Card>
            <CardHeader>
              <CardTitle>Complete Work Order</CardTitle>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="outline">
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Complete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
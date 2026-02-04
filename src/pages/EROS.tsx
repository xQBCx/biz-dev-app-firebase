import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, AlertTriangle, Plus, MapPin, Users, Clock, 
  CheckCircle2, XCircle, Radio, Activity 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useErosIncidents, useMyResponderProfile, ErosIncident } from '@/hooks/useEROS';
import { ErosIncidentCard } from '@/components/eros/ErosIncidentCard';
import { ErosResponderStatus } from '@/components/eros/ErosResponderStatus';
import { ErosCreateIncidentDialog } from '@/components/eros/ErosCreateIncidentDialog';
import { format } from 'date-fns';

export default function EROS() {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: activeIncidents, isLoading: loadingActive } = useErosIncidents('active');
  const { data: allIncidents, isLoading: loadingAll } = useErosIncidents();
  const { data: responderProfile } = useMyResponderProfile();

  const criticalCount = activeIncidents?.filter(i => i.severity === 'critical').length || 0;
  const highCount = activeIncidents?.filter(i => i.severity === 'high').length || 0;

  return (
    <div className="container py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            EROS
          </h1>
          <p className="text-muted-foreground mt-1">
            Emergency Response Operating System
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ErosResponderStatus profile={responderProfile} />
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={criticalCount > 0 ? 'border-destructive bg-destructive/5' : ''}>
          <CardHeader className="pb-2">
            <CardDescription>Critical</CardDescription>
            <CardTitle className="text-3xl text-destructive">{criticalCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className={highCount > 0 ? 'border-orange-500 bg-orange-500/5' : ''}>
          <CardHeader className="pb-2">
            <CardDescription>High Priority</CardDescription>
            <CardTitle className="text-3xl text-orange-500">{highCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Incidents</CardDescription>
            <CardTitle className="text-3xl">{activeIncidents?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total This Month</CardDescription>
            <CardTitle className="text-3xl">{allIncidents?.length || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Active
            {(activeIncidents?.length || 0) > 0 && (
              <Badge variant="secondary" className="ml-1">{activeIncidents?.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">All Incidents</TabsTrigger>
          <TabsTrigger value="my-deployments">My Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {loadingActive ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 w-32 bg-muted rounded" />
                    <div className="h-4 w-48 bg-muted rounded" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : activeIncidents?.length === 0 ? (
            <Card className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium">All Clear</h3>
              <p className="text-muted-foreground">No active incidents at this time.</p>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeIncidents?.map((incident) => (
                <ErosIncidentCard
                  key={incident.id}
                  incident={incident}
                  onClick={() => navigate(`/eros/incidents/${incident.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {loadingAll ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allIncidents?.map((incident) => (
                <ErosIncidentCard
                  key={incident.id}
                  incident={incident}
                  onClick={() => navigate(`/eros/incidents/${incident.id}`)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-deployments">
          <Card className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Active Deployments</h3>
            <p className="text-muted-foreground">You are not currently deployed to any incidents.</p>
            {!responderProfile && (
              <Button className="mt-4" variant="outline" onClick={() => navigate('/eros/profile')}>
                Create Responder Profile
              </Button>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Incident Dialog */}
      <ErosCreateIncidentDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Check, X, Trash2, Star, Eye } from "lucide-react";
import { format } from "date-fns";

type CoachProfile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  location: string | null;
  experience: string | null;
  certifications: string | null;
  specialties: string[] | null;
  bio: string | null;
  avatar_url: string | null;
  status: string;
  session_price: number;
  rating: number | null;
  review_count: number | null;
  featured: boolean | null;
  created_at: string;
};

export default function AdminCoaches() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCoach, setSelectedCoach] = useState<CoachProfile | null>(null);

  const { data: coaches, isLoading } = useQuery({
    queryKey: ["admin-coaches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coach_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CoachProfile[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("coach_profiles")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast({
        title: "Success",
        description: `Coach ${status === "approved" ? "approved" : "rejected"} successfully`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update coach status",
        variant: "destructive",
      });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string; featured: boolean }) => {
      const { error } = await supabase
        .from("coach_profiles")
        .update({ featured })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast({
        title: "Success",
        description: "Coach featured status updated",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("coach_profiles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coaches"] });
      toast({
        title: "Success",
        description: "Coach profile deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete coach",
        variant: "destructive",
      });
    },
  });

  const pendingCoaches = coaches?.filter((c) => c.status === "pending") || [];
  const approvedCoaches = coaches?.filter((c) => c.status === "approved") || [];
  const rejectedCoaches = coaches?.filter((c) => c.status === "rejected") || [];

  const CoachTable = ({ data, showActions = true }: { data: CoachProfile[]; showActions?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Specialties</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Applied</TableHead>
          {showActions && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={showActions ? 6 : 5} className="text-center text-muted-foreground py-8">
              No coaches found
            </TableCell>
          </TableRow>
        ) : (
          data.map((coach) => (
            <TableRow key={coach.id}>
              <TableCell className="font-medium">{coach.full_name}</TableCell>
              <TableCell>{coach.email}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {coach.specialties?.slice(0, 2).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                  {(coach.specialties?.length || 0) > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{(coach.specialties?.length || 0) - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>${coach.session_price}</TableCell>
              <TableCell>{format(new Date(coach.created_at), "MMM d, yyyy")}</TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCoach(coach)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {coach.status === "pending" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => updateStatusMutation.mutate({ id: coach.id, status: "approved" })}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => updateStatusMutation.mutate({ id: coach.id, status: "rejected" })}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {coach.status === "approved" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={coach.featured ? "text-yellow-500" : "text-muted-foreground"}
                        onClick={() => toggleFeaturedMutation.mutate({ id: coach.id, featured: !coach.featured })}
                      >
                        <Star className="h-4 w-4" fill={coach.featured ? "currentColor" : "none"} />
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Coach Profile</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {coach.full_name}'s profile? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteMutation.mutate(coach.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Coach Management</h1>
        <p className="text-muted-foreground">Review applications and manage coach profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCoaches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedCoaches.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedCoaches.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending {pendingCoaches.length > 0 && `(${pendingCoaches.length})`}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-6">
              <CoachTable data={pendingCoaches} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="pt-6">
              <CoachTable data={approvedCoaches} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="pt-6">
              <CoachTable data={rejectedCoaches} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Coach Detail Dialog */}
      {selectedCoach && (
        <AlertDialog open={!!selectedCoach} onOpenChange={() => setSelectedCoach(null)}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {selectedCoach.full_name}
                <Badge variant={selectedCoach.status === "approved" ? "default" : selectedCoach.status === "pending" ? "secondary" : "destructive"}>
                  {selectedCoach.status}
                </Badge>
              </AlertDialogTitle>
            </AlertDialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{selectedCoach.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{selectedCoach.phone || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Location</label>
                  <p>{selectedCoach.location || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Session Price</label>
                  <p>${selectedCoach.session_price}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Experience</label>
                <p>{selectedCoach.experience || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Certifications</label>
                <p>{selectedCoach.certifications || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Specialties</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCoach.specialties?.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  )) || "None"}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                <p className="text-sm">{selectedCoach.bio || "Not provided"}</p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
              {selectedCoach.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    className="text-red-600"
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedCoach.id, status: "rejected" });
                      setSelectedCoach(null);
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      updateStatusMutation.mutate({ id: selectedCoach.id, status: "approved" });
                      setSelectedCoach(null);
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

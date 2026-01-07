import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PermissionManager } from "@/components/PermissionManager";
import { DealRoomPermissionManager } from "@/components/deal-room/DealRoomPermissionManager";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DealRoomParticipantPermissionsProps {
  participantId: string;
  dealRoomId: string;
  userId?: string | null;
  userEmail?: string;
  userName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DealRoomParticipantPermissions = ({
  participantId,
  dealRoomId,
  userId,
  userEmail,
  userName,
  open,
  onOpenChange
}: DealRoomParticipantPermissionsProps) => {
  const isJoinedUser = !!userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Configure access for {userName || userEmail || "this participant"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          {isJoinedUser ? (
            <Tabs defaultValue="deal-room" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="deal-room">Deal Room Access</TabsTrigger>
                <TabsTrigger value="platform">Platform Access</TabsTrigger>
              </TabsList>
              <TabsContent value="deal-room">
                <DealRoomPermissionManager 
                  participantId={participantId}
                  dealRoomId={dealRoomId}
                  participantEmail={userEmail}
                  participantName={userName}
                />
              </TabsContent>
              <TabsContent value="platform">
                <PermissionManager userId={userId} userEmail={userEmail} />
              </TabsContent>
            </Tabs>
          ) : (
            <DealRoomPermissionManager 
              participantId={participantId}
              dealRoomId={dealRoomId}
              participantEmail={userEmail}
              participantName={userName}
            />
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

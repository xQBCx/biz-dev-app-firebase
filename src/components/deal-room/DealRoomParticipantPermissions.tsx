import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PermissionManager } from "@/components/PermissionManager";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DealRoomParticipantPermissionsProps {
  userId: string;
  userEmail?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DealRoomParticipantPermissions = ({
  userId,
  userEmail,
  open,
  onOpenChange
}: DealRoomParticipantPermissionsProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>
            Configure platform access for {userEmail || "this participant"}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] pr-4">
          <PermissionManager userId={userId} userEmail={userEmail} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

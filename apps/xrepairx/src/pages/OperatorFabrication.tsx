import { SidebarProvider } from "@/components/ui/sidebar";
import { OperatorSidebar } from "@/components/OperatorSidebar";
import { PartIdentification } from "@/components/PartIdentification";
import { PrintJobQueue } from "@/components/PrintJobQueue";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Scan, Database, Truck } from "lucide-react";

const OperatorFabrication = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <OperatorSidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Mobile Fabrication</h1>
            <p className="text-muted-foreground">AI part identification, CAD library, and 3D print job management</p>
          </div>

          <Tabs defaultValue="identify" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="identify" className="flex items-center gap-2">
                <Scan className="h-4 w-4" />
                Identify Part
              </TabsTrigger>
              <TabsTrigger value="queue" className="flex items-center gap-2">
                <Printer className="h-4 w-4" />
                Print Queue
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                CAD Library
              </TabsTrigger>
            </TabsList>

            <TabsContent value="identify">
              <PartIdentification 
                onIdentificationComplete={(result) => console.log('Identified:', result)}
                onRequestPrint={(result) => console.log('Print requested:', result)}
              />
            </TabsContent>

            <TabsContent value="queue">
              <PrintJobQueue />
            </TabsContent>

            <TabsContent value="library">
              <div className="text-center py-12 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">CAD Library</h3>
                <p>Upload and manage CAD files for printable parts</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default OperatorFabrication;

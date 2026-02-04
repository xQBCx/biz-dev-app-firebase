import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArchetypeSelector } from '@/components/archetype/ArchetypeSelector';
import { Archetype } from '@/contexts/ArchetypeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ArchetypeSelection() {
  const navigate = useNavigate();
  const [selectedArchetype, setSelectedArchetype] = React.useState<Archetype | null>(null);

  const handleSelect = (archetype: Archetype) => {
    setSelectedArchetype(archetype);
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl py-12">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Choose Your Operating Mode
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Select the archetype that best describes your professional identity. 
            This personalizes your experience with relevant terminology, workflows, and features.
          </p>
        </div>

        <ArchetypeSelector onSelect={handleSelect} className="mb-8" />

        {selectedArchetype && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{selectedArchetype.display_name}</span>
                <span className="text-primary">Selected</span>
              </CardTitle>
              <CardDescription>
                {selectedArchetype.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Your Language</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>Tasks → <span className="font-medium text-foreground">{selectedArchetype.language_config.tasks}</span></li>
                    <li>Deals → <span className="font-medium text-foreground">{selectedArchetype.language_config.deals}</span></li>
                    <li>Dashboard → <span className="font-medium text-foreground">{selectedArchetype.language_config.dashboard}</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Featured Modules</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    {selectedArchetype.onboarding_flow.featured_modules.map((module) => (
                      <li key={module} className="capitalize">{module.replace(/_/g, ' ')}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <Button onClick={handleContinue} className="w-full" size="lg">
                Continue to {selectedArchetype.language_config.dashboard}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

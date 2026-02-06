import { useState } from 'react';
import { 
  Wallpaper, Phone, Tv, Droplets, Lightbulb, Blinds, 
  Table, Image, Archive, Toilet, DoorOpen, Square,
  Radio, Gamepad2, Thermometer, ToggleLeft, Refrigerator,
  Wind, Shell, Microwave, Bath, Armchair, Sofa, Bed,
  IceCreamBowl, Lock, Shield, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MAINTENANCE_ITEMS = [
  { id: 1, name: 'Wallpaper', spanishName: 'Papel Tapiz', icon: Wallpaper },
  { id: 2, name: 'Telephone', spanishName: 'Teléfono', icon: Phone },
  { id: 3, name: 'Television', spanishName: 'Televisión', icon: Tv },
  { id: 4, name: 'Faucet', spanishName: 'Grifo', icon: Droplets },
  { id: 5, name: 'Light', spanishName: 'Bombillo/Foco', icon: Lightbulb },
  { id: 6, name: 'Drapes', spanishName: 'Cortinas', icon: Blinds },
  { id: 7, name: 'Table', spanishName: 'Mesa', icon: Table },
  { id: 8, name: 'Picture', spanishName: 'Pintura/Cuadro Marco', icon: Image },
  { id: 9, name: 'Drawers', spanishName: 'Gaveta/Cajón', icon: Archive },
  { id: 10, name: 'Toilet', spanishName: 'Poseta/Inodoro/Taza', icon: Toilet },
  { id: 11, name: 'Door', spanishName: 'Puerta', icon: DoorOpen },
  { id: 12, name: 'Carpet', spanishName: 'Alfombra/Tapete Carpeta', icon: Square },
  { id: 13, name: 'Radio', spanishName: 'Radio', icon: Radio },
  { id: 14, name: 'Remote Control', spanishName: 'Control Remoto Telecontrol', icon: Gamepad2 },
  { id: 15, name: 'Thermostat', spanishName: 'Termostato', icon: Thermometer },
  { id: 16, name: 'Light Switch', spanishName: 'Encendedor de Luz', icon: ToggleLeft },
  { id: 17, name: 'Refrigerator', spanishName: 'Refrigerador/Nevera', icon: Refrigerator },
  { id: 18, name: 'Vent', spanishName: 'Abertura/Ventilador', icon: Wind },
  { id: 19, name: 'Sink', spanishName: 'Fregadero/Lavamanos', icon: Shell },
  { id: 20, name: 'Microwave', spanishName: 'Microonda', icon: Microwave },
  { id: 21, name: 'Tub', spanishName: 'Bañera/Tina', icon: Bath },
  { id: 22, name: 'Chair', spanishName: 'Silla', icon: Armchair },
  { id: 23, name: 'Sofa', spanishName: 'Sofá', icon: Sofa },
  { id: 24, name: 'Bed', spanishName: 'Cama', icon: Bed },
  { id: 25, name: 'Ice Machine', spanishName: 'Máquina para Hacer Hielo', icon: IceCreamBowl },
  { id: 26, name: 'Door Locks & Chains', spanishName: 'Cerradura y Cadena', icon: Lock },
  { id: 27, name: 'Security Bar', spanishName: 'Barra de Seguridad', icon: Shield },
  { id: 28, name: 'Other', spanishName: 'Otro', icon: Wrench }
];

interface MaintenanceItemsGridProps {
  selectedItems: number[];
  onItemToggle: (itemId: number) => void;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'emergency';
}

export const MaintenanceItemsGrid = ({ selectedItems, onItemToggle, urgencyLevel = 'medium' }: MaintenanceItemsGridProps) => {
  // Priority-based color configurations
  const priorityColors = {
    low: {
      bg: 'bg-blue-500',
      ring: 'ring-blue-500',
      border: 'border-blue-500/30',
      bgLight: 'bg-blue-100',
      text: 'text-blue-800',
      accent: 'bg-blue-600'
    },
    medium: {
      bg: 'bg-yellow-500', 
      ring: 'ring-yellow-500',
      border: 'border-yellow-500/30',
      bgLight: 'bg-yellow-100',
      text: 'text-yellow-800',
      accent: 'bg-yellow-600'
    },
    high: {
      bg: 'bg-orange-500',
      ring: 'ring-orange-500', 
      border: 'border-orange-500/30',
      bgLight: 'bg-orange-100',
      text: 'text-orange-800',
      accent: 'bg-orange-600'
    },
    emergency: {
      bg: 'bg-red-500',
      ring: 'ring-red-500',
      border: 'border-red-500/30', 
      bgLight: 'bg-red-100',
      text: 'text-red-800',
      accent: 'bg-red-600'
    }
  };

  const currentColors = priorityColors[urgencyLevel];

  return (
    <div className="space-y-4">
      <div className="bg-slate text-slate-foreground p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Select Items Needing Maintenance</h3>
        <p className="text-sm text-muted-foreground">Click on the items that need attention. Selected items will match your priority level.</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {MAINTENANCE_ITEMS.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedItems.includes(item.id);
          
          return (
            <Button
              key={item.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onItemToggle(item.id)}
              className={cn(
                "h-36 w-full flex flex-col items-center justify-center gap-3 p-4 text-sm relative transition-all hover:scale-105 border-2",
                isSelected && `ring-2 ${currentColors.ring} shadow-lg ${currentColors.bg} text-white hover:${currentColors.bg}/90 border-transparent`
              )}
            >
              <div className="absolute top-2 left-2 text-xs font-bold opacity-60 bg-black/10 rounded px-1.5 py-0.5 min-w-[20px] text-center">
                {item.id}
              </div>
              <Icon className="h-12 w-12 shrink-0" />
              <div className="text-center leading-tight space-y-1">
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs opacity-80">{item.spanishName}</div>
              </div>
              {isSelected && (
                <div className={`absolute -top-2 -right-2 w-6 h-6 ${currentColors.accent} rounded-full border-3 border-white flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </Button>
          );
        })}
      </div>
      
      {selectedItems.length > 0 && (
        <div className={`${currentColors.bgLight} border ${currentColors.border} rounded-lg p-4`}>
          <div className={`text-sm font-bold ${currentColors.text} flex items-center gap-2`}>
            <div className={`w-3 h-3 rounded-full ${currentColors.bg}`}></div>
            Selected Items ({selectedItems.length}) - {urgencyLevel.charAt(0).toUpperCase() + urgencyLevel.slice(1)} Priority:
          </div>
          <div className={`text-sm ${currentColors.text} mt-2 font-medium`}>
            {selectedItems.map(id => {
              const item = MAINTENANCE_ITEMS.find(i => i.id === id);
              return item?.name;
            }).join(', ')}
          </div>
        </div>
      )}
    </div>
  );
};
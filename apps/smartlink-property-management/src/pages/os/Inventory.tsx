import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Plus, AlertTriangle, TrendingDown } from 'lucide-react';

const Inventory = () => {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Package className="h-8 w-8" />
            Inventory & Supplies
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage property supplies and equipment
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="text-center py-12">
        <Package className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Inventory Management Coming Soon</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Comprehensive inventory tracking, supply management, and automated 
          reordering system will be available soon.
        </p>
      </div>
    </div>
  );
};

export default Inventory;
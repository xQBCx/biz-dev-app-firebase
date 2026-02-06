import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Shield, Users, Search, Plus, Edit, UserCheck } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  color: string;
}

interface UserPermission {
  id: string;
  name: string;
  initials: string;
  role: string;
  email: string;
  lastActive: string;
}

const Permissions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<'roles' | 'users' | 'permissions'>('roles');

  const permissions: Permission[] = [
    { id: '1', name: 'View Dashboard', description: 'Access to main dashboard', category: 'General' },
    { id: '2', name: 'Manage Team', description: 'Add, edit, remove team members', category: 'Staff' },
    { id: '3', name: 'View Maintenance', description: 'View maintenance requests', category: 'Maintenance' },
    { id: '4', name: 'Manage Maintenance', description: 'Create and assign maintenance tasks', category: 'Maintenance' },
    { id: '5', name: 'View Reservations', description: 'Access guest reservations', category: 'Front Desk' },
    { id: '6', name: 'Manage Reservations', description: 'Modify and cancel reservations', category: 'Front Desk' },
    { id: '7', name: 'View Reports', description: 'Access property reports', category: 'Reports' },
    { id: '8', name: 'Manage Housekeeping', description: 'Assign and track cleaning tasks', category: 'Housekeeping' },
    { id: '9', name: 'Admin Settings', description: 'Modify system settings', category: 'Admin' },
    { id: '10', name: 'Payroll Access', description: 'View and manage payroll', category: 'Finance' }
  ];

  const roles: Role[] = [
    {
      id: '1',
      name: 'Owner',
      description: 'Full access to all systems',
      userCount: 1,
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      color: 'bg-red-100 text-red-800'
    },
    {
      id: '2',
      name: 'Operations Manager',
      description: 'Oversees daily operations',
      userCount: 2,
      permissions: ['1', '2', '3', '4', '5', '6', '7', '8'],
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: '3',
      name: 'Front Desk Manager',
      description: 'Manages front desk operations',
      userCount: 1,
      permissions: ['1', '5', '6', '7'],
      color: 'bg-green-100 text-green-800'
    },
    {
      id: '4',
      name: 'Front Desk Clerk',
      description: 'Guest service and check-in/out',
      userCount: 6,
      permissions: ['1', '5'],
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: '5',
      name: 'Maintenance',
      description: 'Property maintenance and repairs',
      userCount: 1,
      permissions: ['1', '3', '4'],
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: '6',
      name: 'Housekeeping',
      description: 'Room cleaning and maintenance',
      userCount: 12,
      permissions: ['1', '8'],
      color: 'bg-purple-100 text-purple-800'
    }
  ];

  const users: UserPermission[] = [
    { id: '1', name: 'Brittany Patel', initials: 'BP', role: 'Owner', email: 'bp@property.com', lastActive: '2 min ago' },
    { id: '2', name: 'Jason Lopez', initials: 'JL', role: 'Operations Manager', email: 'jl@property.com', lastActive: '1 hour ago' },
    { id: '3', name: 'Tiara Zimmerman', initials: 'TZ', role: 'Operations Manager', email: 'tz@property.com', lastActive: '30 min ago' },
    { id: '4', name: 'Gabriela Valle', initials: 'GV', role: 'Front Desk Manager', email: 'gv@property.com', lastActive: '5 min ago' },
    { id: '5', name: 'Cheyann Ludolph', initials: 'CL', role: 'Front Desk Clerk', email: 'cl@property.com', lastActive: '15 min ago' },
    { id: '6', name: 'Brandon McGee', initials: 'BM', role: 'Maintenance', email: 'bm@property.com', lastActive: '45 min ago' }
  ];

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category].push(permission);
    });
    return categories;
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const permissionCategories = getPermissionsByCategory();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permissions & Roles</h2>
          <p className="text-muted-foreground">Manage user roles and access permissions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === 'roles' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('roles')}
        >
          Roles
        </Button>
        <Button
          variant={selectedTab === 'users' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('users')}
        >
          Users
        </Button>
        <Button
          variant={selectedTab === 'permissions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('permissions')}
        >
          Permissions
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={`Search ${selectedTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Roles Tab */}
      {selectedTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    {role.name}
                  </CardTitle>
                  <Badge className={role.color}>
                    {role.userCount} users
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{role.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Permissions ({role.permissions.length})</h4>
                    <div className="space-y-1">
                      {role.permissions.slice(0, 3).map(permId => {
                        const permission = permissions.find(p => p.id === permId);
                        return (
                          <div key={permId} className="text-xs text-muted-foreground flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            {permission?.name}
                          </div>
                        );
                      })}
                      {role.permissions.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{role.permissions.length - 3} more permissions
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="w-3 h-3 mr-1" />
                      Users
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <Badge variant="secondary">{user.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">Last active: {user.lastActive}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit Role
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Permissions Tab */}
      {selectedTab === 'permissions' && (
        <div className="space-y-6">
          {Object.entries(permissionCategories).map(([category, categoryPermissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryPermissions.map((permission) => (
                    <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-muted-foreground">{permission.description}</p>
                      </div>
                      <Switch />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Permissions;
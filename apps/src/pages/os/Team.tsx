import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Grid3X3, List, ArrowUpDown, Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTeamData } from '@/hooks/useTeamData';
import TeamGrid from '@/components/team/TeamGrid';
import TeamList from '@/components/team/TeamList';

const Team = () => {
  const {
    teamMembers,
    loading,
    getTeamMemberStatus,
    getStatusColor,
    getStatusLabel,
    getRoleColor,
    formatRole,
    refreshTeamData
  } = useTeamData();

  const [filteredMembers, setFilteredMembers] = useState(teamMembers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    filterAndSortMembers();
  }, [teamMembers, searchTerm, roleFilter, sortBy]);

  const filterAndSortMembers = () => {
    let filtered = teamMembers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.initials.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(member => 
        member.role.toLowerCase() === roleFilter.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'role':
          return a.role.localeCompare(b.role);
        case 'status':
          const statusA = getTeamMemberStatus(a.id);
          const statusB = getTeamMemberStatus(b.id);
          return statusA.localeCompare(statusB);
        default:
          return 0;
      }
    });

    setFilteredMembers(filtered);
  };

  const uniqueRoles = useMemo(() => 
    [...new Set(teamMembers.map(member => member.role))], 
    [teamMembers]
  );

  const membersByStatus = useMemo(() => ({
    on_shift: filteredMembers.filter(m => getTeamMemberStatus(m.id) === 'on_shift').length,
    break: filteredMembers.filter(m => getTeamMemberStatus(m.id) === 'break').length,
    off_duty: filteredMembers.filter(m => getTeamMemberStatus(m.id) === 'off_duty').length,
  }), [filteredMembers, getTeamMemberStatus]);

  console.log('Team page render:', {
    loading,
    teamMembersCount: teamMembers.length,
    filteredMembersCount: filteredMembers.length,
    viewMode,
    searchTerm,
    roleFilter
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Team Directory</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your team members across all departments.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant="outline" className="text-sm">
                {teamMembers.length} members
              </Badge>
              <Badge className="bg-green-50 text-green-700 border-green-200">
                {membersByStatus.on_shift} on shift
              </Badge>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search team members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="all">All Roles</SelectItem>
                {uniqueRoles.map(role => (
                  <SelectItem key={role} value={role}>
                    {formatRole(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border shadow-lg z-50">
                <SelectItem value="name">Alphabetical</SelectItem>
                <SelectItem value="role">By Role</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      {viewMode === 'grid' ? (
        <TeamGrid
          filteredMembers={filteredMembers}
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          getTeamMemberStatus={getTeamMemberStatus}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          getRoleColor={getRoleColor}
          formatRole={formatRole}
        />
      ) : (
        <TeamList
          filteredMembers={filteredMembers}
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          getTeamMemberStatus={getTeamMemberStatus}
          getStatusColor={getStatusColor}
          getStatusLabel={getStatusLabel}
          getRoleColor={getRoleColor}
          formatRole={formatRole}
        />
      )}
    </div>
  );
};

export default Team;
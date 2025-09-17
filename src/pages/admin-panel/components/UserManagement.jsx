
import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, Calendar } from 'lucide-react';
import dataService from '../../../services/dataService';
import Input from '../../../components/ui/Input';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  setLoading(true);
  dataService.getAllUsers()
    .then(allUsers => {
      setUsers(allUsers.filter(user => user.role !== 'admin')); // show only non-admins
      setLoading(false);
    })
    .catch(() => {
      setUsers([]);
      setLoading(false);
    });
}, []);

  const filteredUsers = users.filter(user => {
    return user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">Manage customer accounts and information</p>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-body font-medium text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">Customer #{user.id}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{user.email}</span>
              </div>
              
              {user.phone && (
                <div className="flex items-center space-x-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.phone}</span>
                </div>
              )}
              
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">{user.orders?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Orders</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">{user.wishlist?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Wishlist</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No users found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

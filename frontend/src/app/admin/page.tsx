'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Gavel,
  Users,
  AlertCircle,
  Building,
  ArrowRight,
  Lock,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Shield,
  Briefcase,
  Check,
  X,
  Mail,
  Phone,
  Key,
  FolderTree,
} from 'lucide-react';
import { api, UserGroupItem, SystemUserItem } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type AdminTab = 'moderation' | 'user-groups' | 'system-users';

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading, openAuthModal } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('moderation');

  // Stats & queues
  const [stats, setStats] = useState<any | null>(null);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [pendingAuctions, setPendingAuctions] = useState<any[]>([]);

  // Master Data: User Groups
  const [userGroups, setUserGroups] = useState<UserGroupItem[]>([]);
  const [userGroupsLoading, setUserGroupsLoading] = useState(false);

  // System Users
  const [systemUsers, setSystemUsers] = useState<SystemUserItem[]>([]);
  const [systemUsersLoading, setSystemUsersLoading] = useState(false);

  // Common UI states
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // User Group Modals
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroupItem | null>(null);
  const [groupFormCode, setGroupFormCode] = useState('');
  const [groupFormName, setGroupFormName] = useState('');
  const [groupFormDesc, setGroupFormDesc] = useState('');
  const [groupFormIsPublic, setGroupFormIsPublic] = useState(false);
  const [groupFormSubmitting, setGroupFormSubmitting] = useState(false);

  // System User Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUserItem | null>(null);
  const [userFormName, setUserFormName] = useState('');
  const [userFormEmail, setUserFormEmail] = useState('');
  const [userFormPassword, setUserFormPassword] = useState('');
  const [userFormPhone, setUserFormPhone] = useState('');
  const [userFormGroupId, setUserFormGroupId] = useState('');
  const [userFormSubmitting, setUserFormSubmitting] = useState(false);

  // Delete Confirm Modal
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'group' | 'user';
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadModerationData(), loadUserGroupsData(), loadSystemUsersData()]);
    } catch (err) {
      console.error('Failed to load initial admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadModerationData = async () => {
    try {
      const [statsRes, propsRes, auctionsRes] = await Promise.all([
        api.getAdminStats(),
        api.getPendingProperties(),
        api.getPendingAuctions(),
      ]);
      setStats(statsRes);
      setPendingProperties(propsRes || []);
      setPendingAuctions(auctionsRes || []);
    } catch (err) {
      console.error('Failed to load moderation data', err);
    }
  };

  const loadUserGroupsData = async () => {
    setUserGroupsLoading(true);
    try {
      const groups = await api.getAdminUserGroups();
      setUserGroups(groups || []);
    } catch (err: any) {
      console.error('Failed to load user groups', err);
    } finally {
      setUserGroupsLoading(false);
    }
  };

  const loadSystemUsersData = async () => {
    setSystemUsersLoading(true);
    try {
      const users = await api.getAdminSystemUsers();
      setSystemUsers(users || []);
    } catch (err: any) {
      console.error('Failed to load system users', err);
    } finally {
      setSystemUsersLoading(false);
    }
  };

  // Moderation Handlers
  const handleApproveProperty = async (id: string) => {
    try {
      await api.approveProperty(id);
      showNotification('Property listing approved and published publicly.');
      loadModerationData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectProperty = async (id: string) => {
    try {
      await api.rejectProperty(id);
      showNotification('Property listing rejected.');
      loadModerationData();
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  const handleApproveAuction = async (id: string) => {
    try {
      await api.approveAuction(id);
      showNotification('Auction approved and live scheduled.');
      loadModerationData();
    } catch (err: any) {
      alert(err.message || 'Auction approval failed');
    }
  };

  // User Group Actions
  const openCreateGroupModal = () => {
    setEditingGroup(null);
    setGroupFormCode('');
    setGroupFormName('');
    setGroupFormDesc('');
    setGroupFormIsPublic(false);
    setErrorMessage(null);
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (grp: UserGroupItem) => {
    setEditingGroup(grp);
    setGroupFormCode(grp.code);
    setGroupFormName(grp.name);
    setGroupFormDesc(grp.description || '');
    setGroupFormIsPublic(grp.is_public_registration);
    setErrorMessage(null);
    setIsGroupModalOpen(true);
  };

  const handleSaveUserGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setGroupFormSubmitting(true);
    try {
      if (editingGroup) {
        await api.updateAdminUserGroup(editingGroup.id, {
          name: groupFormName,
          description: groupFormDesc,
          is_public_registration: groupFormIsPublic,
        });
        showNotification(`User Group "${groupFormName}" updated successfully.`);
      } else {
        await api.createAdminUserGroup({
          code: groupFormCode.trim().toUpperCase(),
          name: groupFormName.trim(),
          description: groupFormDesc.trim(),
          is_public_registration: groupFormIsPublic,
        });
        showNotification(`User Group "${groupFormName}" created successfully.`);
      }
      setIsGroupModalOpen(false);
      loadUserGroupsData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save user group.');
    } finally {
      setGroupFormSubmitting(false);
    }
  };

  const confirmDeleteGroup = (grp: UserGroupItem) => {
    setDeleteConfirm({
      type: 'group',
      id: grp.id,
      title: `User Group "${grp.name}" (${grp.code})`,
    });
  };

  // System User Actions
  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserFormName('');
    setUserFormEmail('');
    setUserFormPassword('');
    setUserFormPhone('');
    setUserFormGroupId(userGroups[0]?.id || '');
    setErrorMessage(null);
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (usr: SystemUserItem) => {
    setEditingUser(usr);
    setUserFormName(usr.full_name);
    setUserFormEmail(usr.email);
    setUserFormPassword('');
    setUserFormPhone(usr.phone || '');
    setUserFormGroupId(usr.group?.id || '');
    setErrorMessage(null);
    setIsUserModalOpen(true);
  };

  const handleSaveSystemUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUserFormSubmitting(true);
    try {
      if (editingUser) {
        await api.updateAdminSystemUser(editingUser.id, {
          full_name: userFormName,
          phone: userFormPhone,
          group_id: userFormGroupId || undefined,
        });
        showNotification(`System user "${userFormName}" updated.`);
      } else {
        if (!userFormPassword || userFormPassword.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
        await api.createAdminSystemUser({
          full_name: userFormName.trim(),
          email: userFormEmail.trim(),
          password: userFormPassword,
          phone: userFormPhone.trim(),
          group_id: userFormGroupId || undefined,
        });
        showNotification(`System user "${userFormName}" created successfully.`);
      }
      setIsUserModalOpen(false);
      loadSystemUsersData();
      loadUserGroupsData(); // refresh counts
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save system user.');
    } finally {
      setUserFormSubmitting(false);
    }
  };

  const confirmDeleteUser = (usr: SystemUserItem) => {
    setDeleteConfirm({
      type: 'user',
      id: usr.id,
      title: `System User "${usr.full_name}" (${usr.email})`,
    });
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      if (deleteConfirm.type === 'group') {
        await api.deleteAdminUserGroup(deleteConfirm.id);
        showNotification('User group deleted.');
        loadUserGroupsData();
      } else {
        await api.deleteAdminSystemUser(deleteConfirm.id);
        showNotification('System user removed.');
        loadSystemUsersData();
        loadUserGroupsData();
      }
    } catch (err: any) {
      alert(err.message || 'Delete operation failed');
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-4 border border-purple-100 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Authentication Required</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Access to the LankaProperty Moderation Console and Master Data Management is restricted to authorized platform administrators and governance moderators.
        </p>
        <button
          onClick={() => openAuthModal('login', 'Please authenticate with an Administrator account.')}
          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Authenticate as Admin</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-brand-dark rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Data &amp; Governance Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            LankaProperty Admin &amp; Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage listing moderation queues, configure Master Data User Groups, and provision internal operational staff accounts (Data Entry, Accountants, Agents).
          </p>
        </div>

        {/* Quick Tabs in Header */}
        <div className="flex bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-inner">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'moderation'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Moderation</span>
            {(pendingProperties.length > 0 || pendingAuctions.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('user-groups')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'user-groups'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>User Groups (Master Data)</span>
          </button>

          <button
            onClick={() => setActiveTab('system-users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'system-users'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>System Users</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* TAB 1: MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-slate-400">Total Listings</span>
                <Building className="w-4 h-4 text-brand-dark" />
              </div>
              <div className="text-2xl font-black text-brand-dark">{stats?.totalProperties ?? '—'}</div>
              <span className="text-[11px] text-slate-400">Published in database</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-amber-500">Pending Review</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600">{stats?.pendingProperties ?? '—'}</div>
              <span className="text-[11px] text-amber-600/80 font-semibold">Action required</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-emerald-600">Live Auctions</span>
                <Gavel className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700">{stats?.liveAuctions ?? '—'}</div>
              <span className="text-[11px] text-emerald-600 font-semibold">Active bidding</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-indigo-600">Verified Agents</span>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-indigo-700">{stats?.verifiedAgents ?? '—'}</div>
              <span className="text-[11px] text-slate-400">Licensed brokers</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-bold text-slate-500">Platform Users</span>
                <Users className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-2xl font-black text-slate-800">{stats?.totalUsers ?? '—'}</div>
              <span className="text-[11px] text-slate-400">Buyers &amp; Sellers</span>
            </div>
          </div>

          {/* Moderation Queue Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-brand-dark">
                  Property Moderation Queue ({pendingProperties.length} Awaiting Vetting)
                </h2>
                <p className="text-xs text-slate-500">
                  Check title deed references, coordinates accuracy, and pricing before publishing.
                </p>
              </div>
            </div>

            {pendingProperties.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-600">Moderation queue is empty!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All submitted properties have been vetted.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingProperties.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition"
                  >
                    <div className="flex gap-3.5">
                      <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                        <img
                          src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                          alt={prop.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{prop.title}</h4>
                        <p className="text-xs text-slate-500">{prop.address}, {prop.city}</p>
                        <div className="text-xs font-black text-brand-dark mt-1">
                          LKR {Number(prop.price_lkr).toLocaleString()}{' '}
                          <span className="font-normal text-slate-400">({prop.land_perches} Perches)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveProperty(prop.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve &amp; Publish</span>
                      </button>
                      <button
                        onClick={() => handleRejectProperty(prop.id)}
                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5 active:scale-95"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Auctions Queue */}
          {pendingAuctions.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-extrabold text-brand-dark">
                Pending Digital Auction Approvals ({pendingAuctions.length})
              </h2>

              <div className="space-y-3">
                {pendingAuctions.map((auc) => (
                  <div
                    key={auc.id}
                    className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{auc.property?.title}</h4>
                      <p className="text-xs text-slate-600">
                        Starting Bid: LKR {Number(auc.starting_bid).toLocaleString()} &bull; Bid Increment: LKR {Number(auc.bid_increment).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleApproveAuction(auc.id)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm self-start md:self-auto active:scale-95"
                    >
                      <Gavel className="w-4 h-4" />
                      <span>Sanction Auction</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER DATA: USER GROUPS */}
      {activeTab === 'user-groups' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Row */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-black text-slate-900">Master Data: User Groups</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure user roles and permission groups. Groups with <strong>Public Registration</strong> are available on the visitor sign-up modal (Buyer, Seller, Agent). Internal operational groups (Data Entry, Accountant, Administrator) are restricted to system staff.
              </p>
            </div>

            <button
              onClick={openCreateGroupModal}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create User Group</span>
            </button>
          </div>

          {/* Quick Group Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total User Groups</span>
                <div className="text-2xl font-black text-slate-900">{userGroups.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FolderTree className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Public Sign-up Groups</span>
                <div className="text-2xl font-black text-emerald-700">
                  {userGroups.filter((g) => g.is_public_registration).length}
                </div>
                <span className="text-[10px] text-slate-400">Buyer, Seller, Agent</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase">Internal Staff Groups</span>
                <div className="text-2xl font-black text-indigo-700">
                  {userGroups.filter((g) => !g.is_public_registration).length}
                </div>
                <span className="text-[10px] text-slate-400">Data Entry, Accountant, Admin</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* User Groups Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Group Name &amp; Code</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Access Type</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Assigned Users</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {userGroups.map((group) => (
                    <tr key={group.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm">{group.name}</span>
                          <span className="font-mono text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                            {group.code}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-500 max-w-xs">
                        {group.description || <span className="italic text-slate-300">No description provided</span>}
                      </td>

                      <td className="px-6 py-4">
                        {group.is_public_registration ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Check className="w-3 h-3" />
                            <span>Public Sign-up</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            <Lock className="w-3 h-3" />
                            <span>Internal Staff Only</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {group.is_system_group ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Shield className="w-3 h-3" />
                            <span>System Default</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <span>Custom Group</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>{group.user_count ?? 0}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditGroupModal(group)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="Edit User Group"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => confirmDeleteGroup(group)}
                            disabled={group.is_system_group || (group.user_count && group.user_count > 0)}
                            className={`p-1.5 rounded-lg border transition ${
                              group.is_system_group || (group.user_count && group.user_count > 0)
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                                : 'border-red-200 text-red-600 hover:bg-red-50'
                            }`}
                            title={
                              group.is_system_group
                                ? 'System core groups cannot be deleted'
                                : group.user_count && group.user_count > 0
                                ? 'Cannot delete group with active assigned users'
                                : 'Delete User Group'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM USERS */}
      {activeTab === 'system-users' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Row */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-black text-slate-900">System Staff &amp; Operational Users</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Create and manage operational accounts (e.g., Data Entry Persons, Accountants, Legal Officers, and Regional Moderators) assigned directly to Master User Groups.
              </p>
            </div>

            <button
              onClick={openCreateUserModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create System User</span>
            </button>
          </div>

          {/* System Users Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Assigned User Group</th>
                    <th className="px-6 py-4">Contact Phone</th>
                    <th className="px-6 py-4">Status &amp; Role</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {systemUsers.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-black text-xs shadow-sm">
                            {usr.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-slate-900">{usr.full_name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span>{usr.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {usr.group ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Briefcase className="w-3 h-3" />
                            <span>{usr.group.name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                            {usr.role}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {usr.phone ? (
                          <span className="font-mono text-xs">{usr.phone}</span>
                        ) : (
                          <span className="text-slate-300 italic">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                          {usr.is_kyc_verified && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {usr.created_at ? new Date(usr.created_at).toLocaleDateString() : '—'}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditUserModal(usr)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="Edit System User"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => confirmDeleteUser(usr)}
                            disabled={usr.email === 'admin@lankaproperty.lk' || usr.id === user?.id}
                            className={`p-1.5 rounded-lg border transition ${
                              usr.email === 'admin@lankaproperty.lk' || usr.id === user?.id
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                                : 'border-red-200 text-red-600 hover:bg-red-50'
                            }`}
                            title={
                              usr.email === 'admin@lankaproperty.lk'
                                ? 'Root administrator account cannot be deleted'
                                : usr.id === user?.id
                                ? 'Cannot delete your own active administrator account'
                                : 'Delete User'
                            }
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE / EDIT USER GROUP                                */}
      {/* ============================================================== */}
      {isGroupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsGroupModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingGroup ? 'Edit User Group' : 'Create New Master User Group'}
                </h3>
                <p className="text-xs text-slate-400">
                  Master Data role and access definition
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Group Code *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingGroup}
                  value={groupFormCode}
                  onChange={(e) => setGroupFormCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DATA_ENTRY or ACCOUNTANT"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase tracking-wide focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Unique uppercase identifier used internally for permissions.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={groupFormName}
                  onChange={(e) => setGroupFormName(e.target.value)}
                  placeholder="e.g. Data Entry Person"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={groupFormDesc}
                  onChange={(e) => setGroupFormDesc(e.target.value)}
                  placeholder="e.g. Responsible for entering property listings, pricing validation, and title check."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              {/* Public Registration Checkbox */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="group-public-check"
                  checked={groupFormIsPublic}
                  disabled={editingGroup?.is_system_group && editingGroup.code === 'SUPER_ADMIN'}
                  onChange={(e) => setGroupFormIsPublic(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="group-public-check" className="text-xs cursor-pointer">
                  <span className="font-bold text-slate-900 block">Allow Public Registration</span>
                  <span className="text-[11px] text-slate-500 leading-relaxed block mt-0.5">
                    If checked, this group will be displayed on the public sign-up modal for any visitor to select. Leave unchecked for internal staff accounts.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={groupFormSubmitting}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {groupFormSubmitting ? 'Saving...' : editingGroup ? 'Update Group' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: CREATE / EDIT SYSTEM USER                               */}
      {/* ============================================================== */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingUser ? 'Edit System Staff User' : 'Create Internal System User'}
                </h3>
                <p className="text-xs text-slate-400">
                  Assign user to a master data group (Data Entry, Accountant, Admin)
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveSystemUser} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={userFormName}
                  onChange={(e) => setUserFormName(e.target.value)}
                  placeholder="e.g. Samantha Perera"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser}
                  value={userFormEmail}
                  onChange={(e) => setUserFormEmail(e.target.value)}
                  placeholder="e.g. dataentry@lankaproperty.lk"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Initial Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={userFormPassword}
                    onChange={(e) => setUserFormPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned User Group (Master Data) *
                </label>
                <select
                  required
                  value={userFormGroupId}
                  onChange={(e) => setUserFormGroupId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Master User Group --</option>
                  {userGroups.map((grp) => (
                    <option key={grp.id} value={grp.id}>
                      {grp.name} ({grp.code}) {!grp.is_public_registration ? '— Internal Staff' : '— Public'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  value={userFormPhone}
                  onChange={(e) => setUserFormPhone(e.target.value)}
                  placeholder="e.g. +94 77 123 4567"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userFormSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {userFormSubmitting ? 'Saving...' : editingUser ? 'Update User' : 'Create System User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CONFIRMATION MODAL                                      */}
      {/* ============================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 mb-1">Confirm Deletion</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-800">{deleteConfirm.title}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-1/2 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={executeDelete}
                className="w-1/2 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

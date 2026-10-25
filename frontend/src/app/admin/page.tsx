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
  Tag,
  Palette,
  Eye,
  CheckSquare,
  GitCompare,
} from 'lucide-react';
import { api, UserGroupItem, SystemUserItem, PropertyCategoryItem } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';

type AdminTab = 'moderation' | 'property-categories' | 'user-groups' | 'system-users';

const COLOR_PRESETS = [
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Royal Blue', hex: '#3B82F6' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Purple', hex: '#8B5CF6' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Teal', hex: '#14B8A6' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Rose', hex: '#F43F5E' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Slate', hex: '#64748B' },
];

const ICON_OPTIONS = [
  'Home',
  'Building2',
  'Compass',
  'Briefcase',
  'Landmark',
  'Trees',
  'Waves',
  'Palmtree',
  'Castle',
  'Store',
];

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading, openAuthModal } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<AdminTab>('moderation');

  // Stats & queues
  const [stats, setStats] = useState<any | null>(null);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [pendingAuctions, setPendingAuctions] = useState<any[]>([]);
  const [comparisonProperty, setComparisonProperty] = useState<any | null>(null);

  // Master Data: Property Categories
  const [propertyCategories, setPropertyCategories] = useState<PropertyCategoryItem[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

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

  // Property Category Modals
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PropertyCategoryItem | null>(null);
  const [categoryFormCode, setCategoryFormCode] = useState('');
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormDesc, setCategoryFormDesc] = useState('');
  const [categoryFormColor, setCategoryFormColor] = useState('#10B981');
  const [categoryFormIcon, setCategoryFormIcon] = useState('Home');
  const [categoryFormOrder, setCategoryFormOrder] = useState(0);
  const [categoryFormIsActive, setCategoryFormIsActive] = useState(true);
  const [categoryFormSubmitting, setCategoryFormSubmitting] = useState(false);

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
    type: 'group' | 'user' | 'category';
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
      await Promise.all([
        loadModerationData(),
        loadPropertyCategoriesData(),
        loadUserGroupsData(),
        loadSystemUsersData(),
      ]);
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

  const loadPropertyCategoriesData = async () => {
    setCategoriesLoading(true);
    try {
      const cats = await api.getAdminPropertyCategories();
      setPropertyCategories(cats || []);
    } catch (err: any) {
      console.error('Failed to load property categories', err);
    } finally {
      setCategoriesLoading(false);
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
      setComparisonProperty(null);
      loadModerationData();
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectProperty = async (id: string, reason?: string) => {
    try {
      await api.rejectProperty(id, reason);
      showNotification('Property listing or pending update rejected.');
      setComparisonProperty(null);
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

  // Property Category Actions
  const openCreateCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormCode('');
    setCategoryFormName('');
    setCategoryFormDesc('');
    setCategoryFormColor('#10B981');
    setCategoryFormIcon('Home');
    setCategoryFormOrder(propertyCategories.length + 1);
    setCategoryFormIsActive(true);
    setErrorMessage(null);
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: PropertyCategoryItem) => {
    setEditingCategory(cat);
    setCategoryFormCode(cat.code);
    setCategoryFormName(cat.name);
    setCategoryFormDesc(cat.description || '');
    setCategoryFormColor(cat.color_code || '#10B981');
    setCategoryFormIcon(cat.icon || 'Home');
    setCategoryFormOrder(cat.display_order || 0);
    setCategoryFormIsActive(cat.is_active);
    setErrorMessage(null);
    setIsCategoryModalOpen(true);
  };

  const handleSavePropertyCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCategoryFormSubmitting(true);
    try {
      if (editingCategory) {
        await api.updateAdminPropertyCategory(editingCategory.id, {
          name: categoryFormName.trim(),
          description: categoryFormDesc.trim(),
          color_code: categoryFormColor.trim(),
          icon: categoryFormIcon.trim(),
          display_order: Number(categoryFormOrder),
          is_active: categoryFormIsActive,
        });
        showNotification(`Property category "${categoryFormName}" updated.`);
      } else {
        await api.createAdminPropertyCategory({
          code: categoryFormCode.trim().toUpperCase(),
          name: categoryFormName.trim(),
          description: categoryFormDesc.trim(),
          color_code: categoryFormColor.trim(),
          icon: categoryFormIcon.trim(),
          display_order: Number(categoryFormOrder),
          is_active: categoryFormIsActive,
        });
        showNotification(`Property category "${categoryFormName}" created.`);
      }
      setIsCategoryModalOpen(false);
      loadPropertyCategoriesData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save property category.');
    } finally {
      setCategoryFormSubmitting(false);
    }
  };

  const confirmDeleteCategory = (cat: PropertyCategoryItem) => {
    setDeleteConfirm({
      type: 'category',
      id: cat.id,
      title: `Property Category "${cat.name}" (${cat.code})`,
    });
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

  // User Group options for CustomSelect dropdown
  const userGroupOptions: SelectOption[] = userGroups.map((grp) => ({
    value: grp.id,
    label: `${grp.name} (${grp.code})`,
    badge: grp.is_public_registration ? 'Public' : 'Staff',
    description: grp.description || (grp.is_public_registration ? 'Public Visitor Registration' : 'Internal Operational Staff'),
  }));

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
      if (!userFormGroupId) {
        throw new Error('Please select an Assigned User Group.');
      }
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
      if (deleteConfirm.type === 'category') {
        await api.deleteAdminPropertyCategory(deleteConfirm.id);
        showNotification('Property category deleted.');
        loadPropertyCategoriesData();
      } else if (deleteConfirm.type === 'group') {
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
            Manage listing moderation queues, configure Master Data Property Categories with custom color codes, manage User Groups, and provision operational staff.
          </p>
        </div>

        {/* Quick Tabs in Header */}
        <div className="flex flex-wrap bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60 shadow-inner gap-1">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
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
            onClick={() => setActiveTab('property-categories')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'property-categories'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Property Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('user-groups')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'user-groups'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>User Groups</span>
          </button>

          <button
            onClick={() => setActiveTab('system-users')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
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
                {pendingProperties.map((prop) => {
                  const hasEdit = Boolean(prop.has_pending_update && prop.pending_update);

                  return (
                    <div
                      key={prop.id}
                      className={`p-4 rounded-2xl border transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        hasEdit
                          ? 'border-purple-200 bg-purple-50/40 hover:border-purple-300'
                          : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex gap-3.5">
                        <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden shrink-0 relative">
                          <img
                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                            alt={prop.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {hasEdit ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-purple-200">
                                <GitCompare className="w-3 h-3 text-purple-600" />
                                Listing Edit &bull; Audit Ready
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                                <Plus className="w-3 h-3 text-emerald-600" />
                                New Submission
                              </span>
                            )}
                            <span className="text-[11px] text-slate-400">
                              By {prop.owner?.full_name || 'Owner'}
                            </span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900">{prop.title}</h4>
                          <p className="text-xs text-slate-500">{prop.address}, {prop.city}</p>
                          <div className="text-xs font-black text-brand-dark mt-1">
                            LKR {Number(prop.price_lkr).toLocaleString()}{' '}
                            <span className="font-normal text-slate-400">({prop.land_perches} Perches)</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasEdit && (
                          <button
                            onClick={() => setComparisonProperty(prop)}
                            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                            <span>Review &amp; Compare</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleApproveProperty(prop.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{hasEdit ? 'Approve Edits' : 'Approve & Publish'}</span>
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
                  );
                })}
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

      {/* TAB 2: MASTER DATA: PROPERTY CATEGORIES */}
      {activeTab === 'property-categories' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Row */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-black text-slate-900">Master Data: Property Categories</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Configure real estate categories and their unique <strong>color codes</strong> and icons. These colors are fetched across the platform for search filters, listing cards, and map pins.
              </p>
            </div>

            <button
              onClick={openCreateCategoryModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Category</span>
            </button>
          </div>

          {/* Quick Category Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase">Total Categories</span>
                <div className="text-2xl font-black text-slate-900">{propertyCategories.length}</div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-600 uppercase">Active Categories</span>
                <div className="text-2xl font-black text-emerald-700">
                  {propertyCategories.filter((c) => c.is_active).length}
                </div>
                <span className="text-[10px] text-slate-400">Available in search &amp; forms</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Palette className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase">Assigned Properties</span>
                <div className="text-2xl font-black text-indigo-700">
                  {propertyCategories.reduce((acc, c) => acc + (c.property_count || 0), 0)}
                </div>
                <span className="text-[10px] text-slate-400">Categorized active listings</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Building className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Categories Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-black tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">Category &amp; Color Badge</th>
                    <th className="px-6 py-4">Code Identifier</th>
                    <th className="px-6 py-4">Color Swatch</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Assigned Listings</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {propertyCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs"
                            style={{
                              backgroundColor: `${cat.color_code || '#10B981'}15`,
                              color: cat.color_code || '#10B981',
                              borderColor: `${cat.color_code || '#10B981'}40`,
                            }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: cat.color_code || '#10B981' }}
                            />
                            <span>{cat.name}</span>
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {cat.code}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-5 h-5 rounded-md border border-slate-300 shadow-inner inline-block"
                            style={{ backgroundColor: cat.color_code }}
                          />
                          <span className="font-mono text-[11px] font-bold text-slate-700">
                            {cat.color_code}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-500 max-w-xs">
                        {cat.description || <span className="italic text-slate-300">No description</span>}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{cat.property_count ?? 0}</span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {cat.is_active ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditCategoryModal(cat)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => confirmDeleteCategory(cat)}
                            disabled={cat.property_count && cat.property_count > 0}
                            className={`p-1.5 rounded-lg border transition ${
                              cat.property_count && cat.property_count > 0
                                ? 'border-slate-100 text-slate-300 cursor-not-allowed bg-slate-50'
                                : 'border-red-200 text-red-600 hover:bg-red-50'
                            }`}
                            title={
                              cat.property_count && cat.property_count > 0
                                ? 'Cannot delete category with active assigned properties'
                                : 'Delete Category'
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

      {/* TAB 3: MASTER DATA: USER GROUPS */}
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

      {/* TAB 4: SYSTEM USERS */}
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
      {/* MODAL: CREATE / EDIT PROPERTY CATEGORY                         */}
      {/* ============================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  {editingCategory ? 'Edit Property Category' : 'Create Master Property Category'}
                </h3>
                <p className="text-xs text-slate-400">
                  Select a distinctive color code and icon for this category
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSavePropertyCategory} className="space-y-4">
              {/* Category Live Preview Banner */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Live Badge Preview:</span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs"
                  style={{
                    backgroundColor: `${categoryFormColor}15`,
                    color: categoryFormColor,
                    borderColor: `${categoryFormColor}40`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryFormColor }} />
                  <span>{categoryFormName || 'Category Name'}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCategory}
                    value={categoryFormCode}
                    onChange={(e) => setCategoryFormCode(e.target.value.toUpperCase())}
                    placeholder="e.g. BEACHFRONT or PENTHOUSE"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold uppercase tracking-wide focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryFormName}
                    onChange={(e) => setCategoryFormName(e.target.value)}
                    placeholder="e.g. Beachfront Villas"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Color Code Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Category Color Code *</span>
                  <span className="font-mono text-[11px] text-slate-500">{categoryFormColor}</span>
                </label>

                {/* Preset Palette */}
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.hex}
                      onClick={() => setCategoryFormColor(preset.hex)}
                      className={`w-7 h-7 rounded-lg border-2 transition-all flex items-center justify-center ${
                        categoryFormColor.toUpperCase() === preset.hex.toUpperCase()
                          ? 'border-slate-900 scale-110 shadow-md ring-2 ring-slate-900/20'
                          : 'border-white hover:scale-105 opacity-85 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name}
                    >
                      {categoryFormColor.toUpperCase() === preset.hex.toUpperCase() && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Hex Picker Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      value={categoryFormColor}
                      onChange={(e) => setCategoryFormColor(e.target.value)}
                      placeholder="#10B981"
                      className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 font-mono text-xs font-bold uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: categoryFormColor }}
                    />
                  </div>

                  <input
                    type="color"
                    value={categoryFormColor.startsWith('#') ? categoryFormColor : '#10B981'}
                    onChange={(e) => setCategoryFormColor(e.target.value)}
                    className="w-9 h-8 p-0.5 rounded-xl border border-slate-300 cursor-pointer bg-white"
                    title="Choose custom color"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={categoryFormDesc}
                  onChange={(e) => setCategoryFormDesc(e.target.value)}
                  placeholder="e.g. Coastal holiday residences, private beach access parcels, and surf resorts."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Icon Identifier
                  </label>
                  <select
                    value={categoryFormIcon}
                    onChange={(e) => setCategoryFormIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={categoryFormOrder}
                    onChange={(e) => setCategoryFormOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Category Active</span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    When active, this category is shown in public search filters and posting wizard.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={categoryFormIsActive}
                  onChange={(e) => setCategoryFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={categoryFormSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {categoryFormSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
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

              <div className="relative z-30">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned User Group (Master Data) *
                </label>
                <CustomSelect
                  value={userFormGroupId}
                  onChange={(val) => setUserFormGroupId(val)}
                  options={userGroupOptions}
                  placeholder="-- Select Master User Group --"
                  icon={<Briefcase className="w-4 h-4 text-slate-400" />}
                />
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
      {/* ============================================================== */}
      {/* PROPERTY COMPARISON AUDIT MODAL                                */}
      {/* ============================================================== */}
      {comparisonProperty && (() => {
        const live = comparisonProperty;
        const pending = comparisonProperty.pending_update || {};

        const isChanged = (field: string) => {
          if (pending[field] === undefined) return false;
          return String(live[field] ?? '').trim() !== String(pending[field] ?? '').trim();
        };

        const hasImagesChanged =
          JSON.stringify(live.images || []) !== JSON.stringify(pending.images || live.images || []);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-brand-dark text-white flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2 border border-purple-500/30">
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Side-by-Side Moderation Audit</span>
                  </div>
                  <h3 className="text-xl font-black">Compare Property Changes</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Review what earlier existed before the update versus what is newly submitted by the owner.
                  </p>
                  <div className="mt-2 text-xs text-slate-300 flex items-center gap-2">
                    <span>Owner: <strong>{live.owner?.full_name || 'Owner'}</strong> ({live.owner?.email})</span>
                    {pending.submitted_at && (
                      <span>&bull; Submitted: {new Date(pending.submitted_at).toLocaleString()}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setComparisonProperty(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comparison Grid Body */}
              <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
                {/* Column Headers */}
                <div className="grid grid-cols-2 gap-4 pb-2 border-b-2 border-slate-200">
                  <div className="flex items-center gap-2 font-black text-xs text-slate-500 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Earlier / Live Version</span>
                  </div>
                  <div className="flex items-center gap-2 font-black text-xs text-purple-700 uppercase tracking-wider">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-600 animate-pulse" />
                    <span>Newly Submitted Updates</span>
                  </div>
                </div>

                {/* 1. Title */}
                <div className={`p-3.5 rounded-2xl border transition ${isChanged('title') ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Property Title</span>
                    {isChanged('title') && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="text-slate-700">{live.title}</div>
                    <div className={isChanged('title') ? 'text-emerald-700 font-bold' : 'text-slate-700'}>{pending.title || live.title}</div>
                  </div>
                </div>

                {/* 2. Price (LKR) */}
                <div className={`p-3.5 rounded-2xl border transition ${isChanged('price_lkr') ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Price (LKR)</span>
                    {isChanged('price_lkr') && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="text-slate-700">LKR {Number(live.price_lkr).toLocaleString()} ({(Number(live.price_lkr) / 1000000).toFixed(2)}M)</div>
                    <div className={isChanged('price_lkr') ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      LKR {Number(pending.price_lkr || live.price_lkr).toLocaleString()} ({(Number(pending.price_lkr || live.price_lkr) / 1000000).toFixed(2)}M)
                    </div>
                  </div>
                </div>

                {/* 3. Category / Type */}
                <div className={`p-3.5 rounded-2xl border transition ${isChanged('property_type') || isChanged('category_id') ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category / Property Type</span>
                    {(isChanged('property_type') || isChanged('category_id')) && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="text-slate-700">{live.category?.name || live.property_type}</div>
                    <div className={isChanged('property_type') || isChanged('category_id') ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {pending.category_name || pending.property_type || live.category?.name || live.property_type}
                    </div>
                  </div>
                </div>

                {/* 4. Purpose */}
                <div className={`p-3.5 rounded-2xl border transition ${isChanged('purpose') ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Listing Purpose</span>
                    {isChanged('purpose') && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="text-slate-700">{live.purpose === 'RENT' ? 'For Rent / Lease' : 'For Sale'}</div>
                    <div className={isChanged('purpose') ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {(pending.purpose || live.purpose) === 'RENT' ? 'For Rent / Lease' : 'For Sale'}
                    </div>
                  </div>
                </div>

                {/* 5. Land & Floor Area */}
                <div className={`p-3.5 rounded-2xl border transition ${isChanged('land_perches') || isChanged('floor_sqft') ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Land (Perches) &amp; Floor (Sqft)</span>
                    {(isChanged('land_perches') || isChanged('floor_sqft')) && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="text-slate-700">{live.land_perches || '—'} Perches &bull; {live.floor_sqft || '—'} sqft</div>
                    <div className={isChanged('land_perches') || isChanged('floor_sqft') ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {pending.land_perches ?? live.land_perches ?? '—'} Perches &bull; {pending.floor_sqft ?? live.floor_sqft ?? '—'} sqft
                    </div>
                  </div>
                </div>

                {/* 6. Rooms & Parking */}
                <div className={`p-3.5 rounded-2xl border transition ${isChanged('bedrooms') || isChanged('bathrooms') || isChanged('parking_slots') ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rooms &amp; Parking</span>
                    {(isChanged('bedrooms') || isChanged('bathrooms') || isChanged('parking_slots')) && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="text-slate-700">{live.bedrooms} Beds &bull; {live.bathrooms} Baths &bull; {live.parking_slots} Parking</div>
                    <div className={isChanged('bedrooms') || isChanged('bathrooms') || isChanged('parking_slots') ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {pending.bedrooms ?? live.bedrooms} Beds &bull; {pending.bathrooms ?? live.bathrooms} Baths &bull; {pending.parking_slots ?? live.parking_slots} Parking
                    </div>
                  </div>
                </div>

                {/* 7. Location & Address */}
                <div className={`p-3.5 rounded-2xl border transition ${isChanged('address') || isChanged('city') || isChanged('district') ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Location &amp; Address</span>
                    {(isChanged('address') || isChanged('city') || isChanged('district')) && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="text-slate-700">{live.address}, {live.city}, {live.district}</div>
                    <div className={isChanged('address') || isChanged('city') || isChanged('district') ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                      {pending.address || live.address}, {pending.city || live.city}, {pending.district || live.district}
                    </div>
                  </div>
                </div>

                {/* 8. Description */}
                <div className={`p-3.5 rounded-2xl border transition ${isChanged('description') ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</span>
                    {isChanged('description') && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Modified</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="text-slate-600 whitespace-pre-wrap">{live.description}</div>
                    <div className={`whitespace-pre-wrap ${isChanged('description') ? 'text-emerald-800 font-medium' : 'text-slate-600'}`}>
                      {pending.description || live.description}
                    </div>
                  </div>
                </div>

                {/* 9. Photos */}
                <div className={`p-3.5 rounded-2xl border transition ${hasImagesChanged ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Property Photos</span>
                    {hasImagesChanged && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-white">Photos Updated</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-wrap gap-2">
                      {(live.images || []).map((img: string, i: number) => (
                        <img key={i} src={img} alt="Earlier" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(pending.images || live.images || []).map((img: string, i: number) => (
                        <img key={i} src={img} alt="Updated" className="w-16 h-16 rounded-lg object-cover border-2 border-emerald-500" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setComparisonProperty(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition w-full sm:w-auto"
                >
                  Close Audit
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleRejectProperty(live.id)}
                    className="px-4 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Changes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApproveProperty(live.id)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve &amp; Publish Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

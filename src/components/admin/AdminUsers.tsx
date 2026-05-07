import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Search, ShieldAlert, ShieldCheck, User as UserIcon, Settings2, Loader2, Slash, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  blocked?: boolean;
  createdAt?: string;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  password?: string;
}

export default function AdminUsers() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    password: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const snap = await getDocs(q);
      const userList: AdminUser[] = [];
      snap.forEach(doc => {
        userList.push({ id: doc.id, ...doc.data() } as AdminUser);
      });
      setUsers(userList);
    } catch (error) {
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBlockStatus = async (user: AdminUser) => {
    if (!confirm(isAr ? 'هل أنت متأكد من تغيير حالة حظر هذا المستخدم؟' : 'Are you sure you want to change this user\'s block status?')) return;
    
    setUpdatingId(user.id);
    const newStatus = !user.blocked;
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, { blocked: newStatus });
      
      setUsers(users.map(u => u.id === user.id ? { ...u, blocked: newStatus } : u));
    } catch (err) {
      console.error("Error updating toggle", err);
      alert(isAr ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleRoleStatus = async (user: AdminUser) => {
     if (!confirm(isAr ? 'هل أنت متأكد من تغيير صلاحية المستخدم؟' : 'Are you sure you want to change this user role?')) return;
     
     setUpdatingId(user.id);
     const newRole = user.role === 'admin' ? 'user' : 'admin';
     try {
       const userRef = doc(db, 'users', user.id);
       await updateDoc(userRef, { role: newRole });
       
       setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
     } catch (err) {
       console.error("Error updating role", err);
       alert(isAr ? 'حدث خطأ' : 'An error occurred');
     } finally {
       setUpdatingId(null);
     }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phone?.includes(searchTerm)
  );

  // Open modal for creating new user
  const openCreateModal = () => {
    setModalMode('create');
    setFormData({ name: '', email: '', phone: '', role: 'user', password: '' });
    setShowModal(true);
  };

  // Open modal for editing user
  const openEditModal = (user: AdminUser) => {
    setModalMode('edit');
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: (user.role as 'user' | 'admin') || 'user'
    });
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setFormData({ name: '', email: '', phone: '', role: 'user', password: '' });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save user (create or update)
  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      if (modalMode === 'create') {
        // Create new user with auto-generated ID
        const newUserRef = doc(collection(db, 'users'));
        await setDoc(newUserRef, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          blocked: false,
          createdAt: new Date().toISOString()
        });
        
        const newUser: AdminUser = {
          id: newUserRef.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          blocked: false,
          createdAt: new Date().toISOString()
        };
        setUsers([newUser, ...users]);
      } else if (modalMode === 'edit' && selectedUser) {
        // Update existing user
        const userRef = doc(db, 'users', selectedUser.id);
        await updateDoc(userRef, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        });
        
        setUsers(users.map(u => u.id === selectedUser.id ? {
          ...u,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role
        } : u));
      }
      
      closeModal();
    } catch (err) {
      console.error("Error saving user", err);
      alert(isAr ? 'حدث خطأ أثناء الحفظ' : 'Error saving user');
    } finally {
      setSaving(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    setUpdatingId(userId);
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      console.error("Error deleting user", err);
      alert(isAr ? 'حدث خطأ أثناء الحذف' : 'Error deleting user');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-border-light pb-6">
        <div>
           <h2 className="text-2xl font-serif font-bold text-coffee-dark">
             {isAr ? 'إدارة المستخدمين' : 'User Management'}
           </h2>
           <p className="text-sm text-coffee-muted mt-1">
             {isAr ? 'التحكم في حسابات العملاء والحظر والصلاحيات.' : 'Manage customer accounts, block status, and roles.'}
           </p>
        </div>
        
        <div className="flex gap-3">
          {/* Add User Button */}
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-coffee-dark transition-colors text-sm font-sans font-medium"
          >
            <Plus className="w-4 h-4" />
            {isAr ? 'إضافة مستخدم' : 'Add User'}
          </button>
          
          {/* Search */}
          <div className="relative w-full md:w-64">
             <Search className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-coffee-muted" />
             <input 
               type="text" 
               placeholder={isAr ? 'بحث بالاسم أو البريد...' : 'Search name, email...'}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-border-light rounded-lg focus:border-brand outline-none text-sm font-sans"
             />
          </div>
        </div>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border-light">
                <h3 className="text-lg font-bold text-coffee-dark font-serif">
                  {modalMode === 'create' 
                    ? (isAr ? 'إضافة مستخدم جديد' : 'Add New User')
                    : (isAr ? 'تعديل المستخدم' : 'Edit User')
                  }
                </h3>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-coffee-muted" />
                </button>
              </div>
              
              <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-coffee-dark mb-2">
                    {isAr ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-border-light rounded-lg focus:border-brand outline-none text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-coffee-dark mb-2">
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-border-light rounded-lg focus:border-brand outline-none text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-coffee-dark mb-2">
                    {isAr ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-border-light rounded-lg focus:border-brand outline-none text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-coffee-dark mb-2">
                    {isAr ? 'الصلاحية' : 'Role'}
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-border-light rounded-lg focus:border-brand outline-none text-sm"
                  >
                    <option value="user">{isAr ? 'مستخدم' : 'User'}</option>
                    <option value="admin">{isAr ? 'مدير' : 'Admin'}</option>
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-3 border border-border-light text-coffee-dark rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-brand text-white rounded-lg hover:bg-coffee-dark transition-colors text-sm font-medium flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isAr ? 'حفظ' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-brand" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden">
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm font-sans whitespace-nowrap" dir={isAr ? 'rtl' : 'ltr'}>
               <thead className="bg-gray-50 text-coffee-muted font-bold tracking-wider uppercase text-xs">
                 <tr>
                   <th className="px-6 py-4">{isAr ? 'المستخدم' : 'User'}</th>
                   <th className="px-6 py-4">{isAr ? 'الاتصال' : 'Contact'}</th>
                   <th className="px-6 py-4">{isAr ? 'الصلاحية' : 'Role'}</th>
                   <th className="px-6 py-4">{isAr ? 'الحالة' : 'Status'}</th>
                   <th className="px-6 py-4 text-end">{isAr ? 'إجراءات' : 'Actions'}</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border-light/50">
                 {filteredUsers.length === 0 ? (
                   <tr>
                     <td colSpan={5} className="px-6 py-8 text-center text-coffee-muted">
                        {isAr ? 'لا يوجد مستخدمين.' : 'No users found.'}
                     </td>
                   </tr>
                 ) : (
                   filteredUsers.map((user, idx) => (
                     <motion.tr 
                       key={user.id}
                       initial={{ opacity: 0, y: 10 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.05 }}
                       className="hover:bg-gray-50/50 transition-colors"
                     >
                       <td className="px-6 py-4">
                         <div className="flexItems-center space-x-3 rtl:space-x-reverse">
                           <div className="w-8 h-8 bg-brand/10 rounded-full flex items-center justify-center text-brand shrink-0">
                             <UserIcon className="w-4 h-4" />
                           </div>
                           <div>
                             <p className="font-bold text-coffee-dark">{user.name || 'N/A'}</p>
                             <p className="text-xs text-coffee-muted">{user.id.substring(0,8)}...</p>
                           </div>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-coffee-muted">
                          <div>
                            <p className="font-medium text-coffee-dark">{user.phone || 'N/A'}</p>
                            <p className="text-xs">{user.email}</p>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {user.role || 'user'}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                            user.blocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                          }`}>
                            {user.blocked ? (
                              <><Slash className="w-3 h-3 me-1" /> {isAr ? 'محظور' : 'Blocked'}</>
                            ) : (
                              <><ShieldCheck className="w-3 h-3 me-1" /> {isAr ? 'نشط' : 'Active'}</>
                            )}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-end">
                          <div className="flex justify-end gap-2">
                             <button
                               onClick={() => openEditModal(user)}
                               disabled={updatingId === user.id}
                               className="p-2 text-coffee-muted hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200 disabled:opacity-50"
                               title={isAr ? 'تعديل' : 'Edit'}
                             >
                               {updatingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit2 className="w-4 h-4" />}
                             </button>
                             <button
                               onClick={() => toggleRoleStatus(user)}
                               disabled={updatingId === user.id}
                               className="p-2 text-coffee-muted hover:text-brand hover:bg-brand/10 rounded-lg transition-colors border border-transparent hover:border-brand/20 disabled:opacity-50"
                               title="Toggle Role"
                             >
                               {updatingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
                             </button>
                             <button
                               onClick={() => toggleBlockStatus(user)}
                               disabled={updatingId === user.id}
                               className={`p-2 rounded-lg transition-colors border border-transparent disabled:opacity-50 ${
                                 user.blocked 
                                   ? 'text-green-600 hover:bg-green-50 hover:border-green-200' 
                                   : 'text-red-500 hover:bg-red-50 hover:border-red-200'
                               }`}
                               title={user.blocked ? "Unblock" : "Block"}
                             >
                               {updatingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                  user.blocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />
                               )}
                             </button>
                             <button
                               onClick={() => handleDeleteUser(user.id)}
                               disabled={updatingId === user.id}
                               className="p-2 text-coffee-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 disabled:opacity-50"
                               title={isAr ? 'حذف' : 'Delete'}
                             >
                               {updatingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                             </button>
                          </div>
                       </td>
                     </motion.tr>
                   ))
                 )}
               </tbody>
             </table>
          </div>
        </div>
      )}
    </div>
  );
}

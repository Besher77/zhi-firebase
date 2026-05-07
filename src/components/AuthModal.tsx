import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Lock, LogOut, Package, Settings, Phone, LayoutDashboard, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

export default function AuthModal() {
  const { t, i18n } = useTranslation();
  const { user, isModalOpen, modalView, logout, closeModal, openModal, setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone validation: MUST start with 5 and be exactly 9 digits long
  const isValidPhone = (phoneNumber: string) => {
    return /^5\d{8}$/.test(phoneNumber);
  };

  useEffect(() => {
    if (modalView === 'editProfile' && user) {
      setEditName(user.name);
      setEditPhone(user.phone?.replace('+966', '') || '');
    }
  }, [modalView, user]);

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidPhone(editPhone)) {
      setError(t('auth.errors.invalidPhone'));
      return;
    }

    setLoading(true);

    try {
      if (user) {
        // Update Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: editName,
          phone: `+966${editPhone}`
        }, { merge: true });

        // Update Firebase Auth profile
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: editName });
        }

        // Update local context state
        setUser({ ...user, name: editName, phone: `+966${editPhone}` });

        // Go back to profile view
        openModal('profile');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const getTranslatedError = (errCode: string) => {
    switch (errCode) {
      case 'auth/email-already-in-use':
        return t('auth.errors.emailInUse');
      case 'auth/invalid-email':
        return t('auth.errors.invalidEmail');
      case 'auth/weak-password':
        return t('auth.errors.weakPassword');
      case 'auth/user-not-found':
        return t('auth.errors.userNotFound');
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return t('auth.errors.wrongPassword');
      default:
        return t('auth.errors.default');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (modalView === 'signUp') {
      if (!isValidPhone(phone)) {
        setError(t('auth.errors.invalidPhone'));
        return;
      }
    }

    setLoading(true);

    try {
      if (modalView === 'signUp') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update profile
        await updateProfile(firebaseUser, { displayName: name });

        // Store additional user data in Firestore
        // Default role is 'user'
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name,
          email,
          phone: `+966${phone}`,
          role: 'user',
          createdAt: new Date().toISOString()
        });

        closeModal();
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        closeModal();
      }
    } catch (err: any) {
      console.error(err);
      setError(getTranslatedError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-coffee-light rounded-xl shadow-2xl overflow-hidden mx-4 text-coffee-dark max-h-[90vh] overflow-y-auto"
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 end-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content Logic */}
            <div className="p-8 md:p-12">

              {/* Profile View */}
              {modalView === 'profile' && user && (
                <div className="text-center">
                  <div className="w-20 h-20 bg-brand/20 text-brand rounded-full flex items-center justify-center mx-auto mb-6">
                    <User className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-serif mb-1">{t('auth.welcome')},</h2>
                  <h3 className="text-3xl font-serif font-bold mb-2 text-brand">{user.name}</h3>
                  <div className="inline-block px-3 py-1 mb-6 text-xs font-bold uppercase tracking-wider bg-black/5 rounded-full">
                    {user.role}
                  </div>
                  <p className="text-sm font-sans text-coffee-muted mb-8">{user.email}</p>

                  <div className="space-y-3 mb-8">
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={closeModal}
                        className="w-full flex items-center justify-center py-3 px-4 border border-brand bg-brand/5 text-brand rounded-lg hover:bg-brand hover:text-white transition-colors font-sans text-sm font-bold"
                      >
                        <LayoutDashboard className="w-4 h-4 me-2" />
                        {t('auth.adminDash')}
                      </Link>
                    )}
                    <Link
                      to="/orders"
                      onClick={closeModal}
                      className="w-full flex items-center justify-center py-3 px-4 border border-border-light rounded-lg hover:border-brand hover:text-brand transition-colors font-sans text-sm font-medium"
                    >
                      <Package className="w-4 h-4 me-2" />
                      {t('auth.orders')}
                    </Link>
                    <button
                      onClick={() => openModal('editProfile')}
                      className="w-full flex items-center justify-center py-3 px-4 border border-border-light rounded-lg hover:border-brand hover:text-brand transition-colors font-sans text-sm font-medium"
                    >
                      <Settings className="w-4 h-4 me-2" />
                      {i18n.language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                    </button>
                    <Link
                      to="/addresses"
                      onClick={closeModal}
                      className="w-full flex items-center justify-center py-3 px-4 border border-border-light rounded-lg hover:border-brand hover:text-brand transition-colors font-sans text-sm font-bold"
                    >
                      <MapPin className="w-4 h-4 me-2" />
                      {i18n.language === 'ar' ? 'عناويني' : 'My Addresses'}
                    </Link>
                  </div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center justify-center py-3 bg-coffee-dark text-white rounded-lg hover:bg-brand transition-colors font-sans text-sm font-bold tracking-widest uppercase"
                  >
                    <LogOut className="w-4 h-4 me-2" />
                    {t('auth.logoutBtn')}
                  </button>
                </div>
              )}

              {/* Edit Profile View */}
              {modalView === 'editProfile' && user && (
                <div>
                  <div className="flex items-center mb-8 border-b border-border-light pb-4">
                    <button onClick={() => { setError(''); openModal('profile'); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 me-4 rtl:rotate-0 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                    </button>
                    <h2 className="text-2xl font-serif">{i18n.language === 'ar' ? 'تعديل الملف الشخصي' : 'Edit Profile'}</h2>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 mb-6 rounded-lg text-sm font-sans text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleEditProfile} className="space-y-5">
                    <div className="relative">
                      <User className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-coffee-muted" />
                      <input
                        type="text"
                        placeholder={t('auth.name')}
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full py-4 ps-12 pe-4 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors font-sans text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="relative w-1/3 shrink-0">
                        <select
                          className="w-full h-full py-4 px-4 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors font-sans text-sm text-coffee-dark cursor-not-allowed bg-gray-50"
                          disabled
                        >
                          <option value="+966">+966 (SA)</option>
                        </select>
                      </div>
                      <div className="relative flex-1">
                        <Phone className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-coffee-muted" />
                        <input
                          type="tel"
                          placeholder={t('auth.phone')}
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                          className="w-full py-4 ps-10 pe-4 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors font-sans text-sm"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-coffee-dark text-white rounded-lg hover:bg-brand transition-colors font-sans text-sm font-bold tracking-widest uppercase mt-4 disabled:opacity-50"
                    >
                      {loading ? '...' : (i18n.language === 'ar' ? 'حفظ التغييرات' : 'Save Changes')}
                    </button>
                  </form>
                </div>
              )}

              {/* Login / Signup Views */}
              {(modalView === 'signIn' || modalView === 'signUp') && (
                <div>
                  <h2 className="text-3xl font-serif mb-8 text-center">
                    {modalView === 'signIn' ? t('auth.signIn') : t('auth.signUp')}
                  </h2>

                  {error && (
                    <div className="bg-red-50 text-red-500 p-3 mb-6 rounded-lg text-sm font-sans text-center">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleAuth} className="space-y-5">
                    {modalView === 'signUp' && (
                      <>
                        <div className="relative">
                          <User className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-coffee-muted" />
                          <input
                            type="text"
                            placeholder={t('auth.name')}
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full py-4 ps-12 pe-4 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors font-sans text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <div className="relative w-1/3 shrink-0">
                            <select
                              className="w-full h-full py-4 px-4 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors font-sans text-sm text-coffee-dark cursor-not-allowed bg-gray-50"
                              disabled
                            >
                              <option value="+966">+966 (SA)</option>
                            </select>
                          </div>
                          <div className="relative flex-1">
                            <Phone className="absolute top-1/2 -translate-y-1/2 start-4 w-4 h-4 text-coffee-muted" />
                            <input
                              type="tel"
                              placeholder={t('auth.phone')}
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                              className="w-full py-4 ps-10 pe-4 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors font-sans text-sm"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="relative">
                      <Mail className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-coffee-muted" />
                      <input
                        type="email"
                        placeholder={t('auth.email')}
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full py-4 ps-12 pe-4 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors font-sans text-sm"
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-coffee-muted" />
                      <input
                        type="password"
                        placeholder={t('auth.password')}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full py-4 ps-12 pe-4 bg-white border border-border-light rounded-lg outline-none focus:border-brand transition-colors font-sans text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-coffee-dark text-white rounded-lg hover:bg-brand transition-colors font-sans text-sm font-bold tracking-widest uppercase mt-4 disabled:opacity-50"
                    >
                      {loading ? '...' : (modalView === 'signIn' ? t('auth.loginBtn') : t('auth.registerBtn'))}
                    </button>
                  </form>

                  <div className="mt-8 text-center text-sm font-sans text-coffee-muted border-t border-border-light pt-6">
                    {modalView === 'signIn' ? (
                      <p>
                        {t('auth.noAccount')} <button onClick={() => { setError(''); openModal('signUp'); }} className="text-brand font-bold ms-1 hover:underline">{t('auth.signUp')}</button>
                      </p>
                    ) : (
                      <p>
                        {t('auth.hasAccount')} <button onClick={() => { setError(''); openModal('signIn'); }} className="text-brand font-bold ms-1 hover:underline">{t('auth.signIn')}</button>
                      </p>
                    )}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';

export type User = {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  blocked?: boolean;
} | null;

type AuthModalView = 'signIn' | 'signUp' | 'profile' | 'editProfile';

interface AuthContextType {
  user: User;
  loading: boolean;
  isModalOpen: boolean;
  modalView: AuthModalView;
  logout: () => Promise<void>;
  openModal: (view?: AuthModalView) => void;
  closeModal: () => void;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalView, setModalView] = useState<AuthModalView>('signIn');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.blocked) {
              await signOut(auth);
              setUser(null);
              setLoading(false);
              return;
            }

            setUser({
              uid: firebaseUser.uid,
              name: userData.name || 'User',
              email: firebaseUser.email || '',
              phone: userData.phone || '',
              role: userData.role || 'user',
              blocked: false
            });
          } else {
            // Fallback if doc not found
            setUser({
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              phone: '',
              role: 'user',
              blocked: false
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const openModal = (view?: AuthModalView) => {
    if (view) setModalView(view);
    else setModalView(user ? 'profile' : 'signIn');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isModalOpen, modalView, logout, openModal, closeModal, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

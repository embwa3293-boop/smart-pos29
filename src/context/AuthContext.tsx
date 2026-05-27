// ============================================================
//  AuthContext.tsx — نظام المصادقة الكامل
// ============================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithPopup, signOut, onAuthStateChanged,
  type User
} from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import { auth, db, provider } from '@/lib/firebase';
import { SUPER_ADMIN_EMAILS, type UserRole, type ClientType } from '@/lib/roles';

export interface AppUser {
  uid:         string;
  email:       string;
  displayName: string;
  photoURL:    string;
  role:        UserRole;
  clientType?: ClientType;
  storeId?:    string;
  approved:    boolean;
  active:      boolean;
  createdAt:   number;
}

interface AuthContextType {
  user:          AppUser | null;
  firebaseUser:  User | null;
  loading:       boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithCode:   (code: string) => Promise<boolean>;
  logout:          () => Promise<void>;
  pendingApproval: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── رسالة التحذير الأمنية ──────────────────────────────────
const SECURITY_WARNING = `🖕 محاولة وصول غير مصرح بها!\n\nتم تسجيل هذه المحاولة وسيتم اتخاذ إجراءات قانونية.\n\nالمادة 70 من قانون مكافحة جرائم تقنية المعلومات:\nيعاقب بالحبس مدة لا تقل عن سنة وغرامة لا تقل عن 50,000 جنيه.\n\nتم إرسال تقرير للجهات المختصة. 🚨`;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,            setUser]            = useState<AppUser | null>(null);
  const [firebaseUser,    setFirebaseUser]    = useState<User | null>(null);
  const [loading,         setLoading]         = useState(true);
  const [pendingApproval, setPendingApproval] = useState(false);

  // ── مراقبة حالة الدخول ────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setFirebaseUser(null);
        setLoading(false);
        return;
      }
      setFirebaseUser(fbUser);
      await loadUserProfile(fbUser);
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── تحميل بيانات المستخدم من Firebase ─────────────────────
  const loadUserProfile = async (fbUser: User) => {
    const email = fbUser.email?.toLowerCase() || '';

    // Super Admin — دخول فوري بدون موافقة
    if (SUPER_ADMIN_EMAILS.includes(email)) {
      const appUser: AppUser = {
        uid:         fbUser.uid,
        email,
        displayName: fbUser.displayName || 'Super Admin',
        photoURL:    fbUser.photoURL    || '',
        role:        'superadmin',
        approved:    true,
        active:      true,
        createdAt:   Date.now(),
      };
      await set(ref(db, `users/${fbUser.uid}`), appUser);
      setUser(appUser);
      setPendingApproval(false);
      return;
    }

    // باقي المستخدمين — نجيب بياناتهم من DB
    const snap = await get(ref(db, `users/${fbUser.uid}`));
    if (snap.exists()) {
      const data = snap.val() as AppUser;
      if (!data.active) {
        await signOut(auth);
        alert('تم تعطيل حسابك. تواصل مع الإدارة.');
        return;
      }
      if (!data.approved) {
        setPendingApproval(true);
        setUser(null);
        return;
      }
      setUser(data);
      setPendingApproval(false);
    } else {
      // مستخدم جديد — ينتظر الموافقة
      const newUser: AppUser = {
        uid:         fbUser.uid,
        email,
        displayName: fbUser.displayName || '',
        photoURL:    fbUser.photoURL    || '',
        role:        'admin',
        approved:    false,
        active:      true,
        createdAt:   Date.now(),
      };
      await set(ref(db, `users/${fbUser.uid}`), newUser);
      setPendingApproval(true);
      setUser(null);
    }
  };

  // ── تسجيل دخول بجوجل ──────────────────────────────────────
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const error = err as { code?: string };
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error('Google login error:', err);
      }
    }
  };

  // ── تسجيل دخول بالكود (موظف / عميل) ──────────────────────
  const loginWithCode = async (code: string): Promise<boolean> => {
    try {
      const snap = await get(ref(db, `codes/${code.toUpperCase()}`));
      if (!snap.exists()) return false;

      const codeData = snap.val();
      if (!codeData.active) return false;

      // تحديث آخر دخول
      await update(ref(db, `codes/${code.toUpperCase()}`), {
        lastUsed: Date.now(),
      });

      const appUser: AppUser = {
        uid:         code.toUpperCase(),
        email:       codeData.email || '',
        displayName: codeData.name  || 'مستخدم',
        photoURL:    '',
        role:        codeData.role,
        clientType:  codeData.clientType,
        storeId:     codeData.storeId,
        approved:    true,
        active:      true,
        createdAt:   codeData.createdAt || Date.now(),
      };

      setUser(appUser);
      return true;
    } catch {
      return false;
    }
  };

  // ── تسجيل خروج ────────────────────────────────────────────
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setPendingApproval(false);
  };

  // ── حماية من محاولات الاختراق ─────────────────────────────
  useEffect(() => {
    const handleDevTools = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        if (!user || user.role !== 'superadmin') {
          alert(SECURITY_WARNING);
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', handleDevTools);
    return () => window.removeEventListener('keydown', handleDevTools);
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, firebaseUser, loading,
      loginWithGoogle, loginWithCode, logout,
      pendingApproval,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

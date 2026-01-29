'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    User as FirebaseUser,
    signInWithPopup,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { createUser, getUser } from '@/services/firestore';
import { User } from '@/types';

interface AuthContextType {
    user: FirebaseUser | null;
    userData: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [userData, setUserData] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                // Fetch or create user data in Firestore
                try {
                    let data = await getUser(firebaseUser.uid) as User | null;

                    if (!data) {
                        // Create user if doesn't exist
                        await createUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email || '',
                            displayName: firebaseUser.displayName || '',
                            phone: '', // Will be filled in later
                            photoURL: firebaseUser.photoURL || undefined,
                            isPhoneVisible: true,
                            language: 'is', // Default to Icelandic
                        });
                        data = await getUser(firebaseUser.uid) as User | null;
                    }

                    setUserData(data);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUserData(null);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };



    const signInWithEmail = async (email: string, pass: string) => {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signUpWithEmail = async (email: string, pass: string, name: string) => {
        const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
        const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

        if (userCredential.user) {
            await updateProfile(userCredential.user, { displayName: name });
            // Create user document immediately
            await createUser({
                uid: userCredential.user.uid,
                email: email,
                displayName: name,
                phone: '',
                isPhoneVisible: true,
                language: 'is',
            });
        }
    };

    const value = {
        user,
        userData,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

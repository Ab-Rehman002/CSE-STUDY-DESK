import { createContext, useContext, useState, useEffect } from "react";
import { adminSignIn, adminSignOut, onAuthChange, getSession } from "../lib/storage.js";

const AdminContext = createContext(null);

// Being logged in and being an admin are not the same thing. The only
// thing that makes someone an admin is the `is_admin` flag in their
// Supabase "app_metadata" — a field that can only be set from the
// Supabase Dashboard or a service-role key, never by the user themselves.
// Do not go back to "has a session = isAdmin".
function deriveIsAdmin(session) {
  return Boolean(session?.user?.app_metadata?.is_admin);
}

export function AdminProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getSession().then((session) => { setIsAdmin(deriveIsAdmin(session)); setReady(true); });
    const unsubscribe = onAuthChange((session) => setIsAdmin(deriveIsAdmin(session)));
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const session = await adminSignIn(email, password);
      if (!deriveIsAdmin(session)) {
        // Valid account, but not flagged as admin — don't leave a session
        // sitting around client-side for no reason.
        await adminSignOut();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => { await adminSignOut(); };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, ready }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
}

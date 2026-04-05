import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import { AdminLoadingState } from "@/modules/admin/components/AdminLoadingState";

export function AdminRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, loading, refreshUser, token, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || user || loading) {
      return;
    }

    void refreshUser().catch(() => {
      navigate("/login", { replace: true });
    });
  }, [loading, navigate, refreshUser, token, user]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading || !user) {
    return <AdminLoadingState />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

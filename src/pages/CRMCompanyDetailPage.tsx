import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { CRMCompanyDetail } from "@/components/CRMCompanyDetail";

const CRMCompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  if (!id) {
    navigate("/crm");
    return null;
  }

  return (
    <CRMCompanyDetail
      companyId={id}
      onBack={() => navigate("/crm")}
      onEdit={() => navigate(`/crm/companies/${id}/edit`)}
    />
  );
};

export default CRMCompanyDetailPage;

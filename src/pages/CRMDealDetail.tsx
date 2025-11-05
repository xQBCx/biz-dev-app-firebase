import { CRMDealDetail } from "@/components/CRMDealDetail";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const CRMDealDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-depth flex items-center justify-center">
        <Card className="p-8">
          <p>Deal not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        <CRMDealDetail 
          dealId={id}
          onBack={() => navigate("/crm")}
          onEdit={() => navigate(`/crm/deals/${id}/edit`)}
        />
      </div>
    </div>
  );
};

export default CRMDealDetailPage;

import { AppLayout } from "@/components/layout/AppLayout";
import { InspectionForm } from "@/components/inspection/InspectionForm";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NewInspection = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/inspections");
  };

  const handleCancel = () => {
    navigate("/inspections");
  };

  return (
    <AppLayout>
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-black uppercase tracking-wider sm:text-3xl">
          New Inspection
        </h1>
        <p className="mt-2 text-muted-foreground">
          Create a new in-process inspection record
        </p>
      </motion.section>

      <InspectionForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </AppLayout>
  );
};

export default NewInspection;
